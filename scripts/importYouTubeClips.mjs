/**
 * importYouTubeClips.mjs
 *
 * Fetches all public videos from every active `youtubeSource` channel in
 * Sanity and upserts them as historicalClip documents.
 *
 * Channels are configured entirely in Sanity (see schemaTypes/youtubeSource.ts) —
 * add a document there to subscribe to another channel, no code change needed.
 *
 * Matching is done on the `youtubeId` field, not on document _id. This means
 * a historicalClip created by hand in Studio (any _id) is found and updated
 * in place once an editor fills in its `youtubeId` — the script never creates
 * a duplicate document for a video that's already tracked.
 *
 * Editorial fields are preserved on existing documents:
 *   - title, description, slug, source, year: kept once set (never clobbered
 *     by raw YouTube metadata)
 *   - videoUrl: refreshed from YouTube on every run UNLESS linkStatus is
 *     "reviewed" (an editor has explicitly verified/locked the link)
 *   - linkStatus: preserved; new documents start as "unlinked"
 * A slug is generated from the title for any document that doesn't have one
 * yet (new imports, or older docs synced before this existed).
 *
 * _id format for brand-new documents: ytclip-<youtubeId> (stable, idempotent).
 * Existing documents keep whatever _id they already have.
 *
 * Required env vars:
 *   YOUTUBE_API_KEY   — YouTube Data API v3 key
 *   SANITY_TOKEN      — Sanity API token (editor or write)
 *   SANITY_DATASET    — Target dataset (default: staging — NEVER production unless explicit)
 *
 * Usage:
 *   node scripts/importYouTubeClips.mjs
 *   SANITY_DATASET=production node scripts/importYouTubeClips.mjs   ← only when ready
 */

import { createClient } from '@sanity/client'
import { get } from 'node:https'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID   = 'n2ynpgty'
const API_VERSION  = '2024-01-01'

const YT_API_KEY     = process.env.YOUTUBE_API_KEY
const SANITY_TOKEN   = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'staging'

// ── Guards ────────────────────────────────────────────────────────────────────

if (!YT_API_KEY) {
  console.error('❌  YOUTUBE_API_KEY er ikke satt.')
  process.exit(1)
}
if (!SANITY_TOKEN) {
  console.error('❌  SANITY_TOKEN er ikke satt.')
  process.exit(1)
}
if (SANITY_DATASET === 'production') {
  console.warn('⚠️  Kjører mot PRODUCTION-datasettet. Ctrl-C innen 5 sek for å avbryte.')
  await new Promise(r => setTimeout(r, 5000))
}

console.log(`📡  Dataset: ${SANITY_DATASET}\n`)

// ── Sanity client ─────────────────────────────────────────────────────────────

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    SANITY_DATASET,
  apiVersion: API_VERSION,
  token:      SANITY_TOKEN,
  useCdn:     false,
})

// ── YouTube helpers ───────────────────────────────────────────────────────────

function ytFetch(url) {
  return new Promise((resolve, reject) => {
    get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`YouTube API svarte ${res.statusCode}`))
        res.resume()
        return
      }
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function getUploadsPlaylistId(channelId) {
  const url =
    `https://www.googleapis.com/youtube/v3/channels` +
    `?part=contentDetails&id=${channelId}&key=${YT_API_KEY}`
  const data = await ytFetch(url)
  if (!data.items?.length) throw new Error(`Kanal ikke funnet: ${channelId}`)
  return data.items[0].contentDetails.relatedPlaylists.uploads
}

async function fetchAllPlaylistItems(playlistId) {
  const items = []
  let pageToken = undefined

  do {
    const pagePart = pageToken ? `&pageToken=${pageToken}` : ''
    const url =
      `https://www.googleapis.com/youtube/v3/playlistItems` +
      `?part=snippet&maxResults=50&playlistId=${playlistId}${pagePart}&key=${YT_API_KEY}`
    const data = await ytFetch(url)
    for (const item of data.items ?? []) {
      if (item.snippet?.resourceId?.videoId) items.push(item.snippet)
    }
    pageToken = data.nextPageToken
    if (pageToken) await new Promise(r => setTimeout(r, 100)) // gentle rate limit
  } while (pageToken)

  return items
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function extractYear(publishedAt) {
  if (!publishedAt) return undefined
  const y = new Date(publishedAt).getFullYear()
  return Number.isFinite(y) ? y : undefined
}

function bestThumbnail(thumbnails) {
  // Prefer highest resolution available
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    undefined
  )
}

// Mirrors the project's existing Norwegian-slug convention (æ/ø/å spelled out
// as single ASCII letters, not stripped) — see historicalclip-*-froken-*,
// historicalclip-*-lordagskveld-* etc. for the observed pattern.
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

// ── Sources (channels) ────────────────────────────────────────────────────────

async function getActiveSources() {
  return client.fetch(`
    *[_type == "youtubeSource" && isActive != false]{
      _id, name, channelId, sourceLabel
    }
  `)
}

// ── Import logic ──────────────────────────────────────────────────────────────

async function importClips(snippets, sourceLabel) {
  let created = 0
  let updated = 0
  let skipped = 0

  for (const snippet of snippets) {
    const videoId = snippet.resourceId?.videoId
    if (!videoId) { skipped++; continue }

    // Match by youtubeId, not _id — finds hand-created documents too, so the
    // script never spawns a duplicate for a video that's already tracked.
    const existing = await client.fetch(
      `*[_type == "historicalClip" && youtubeId == $videoId][0]`,
      { videoId }
    )

    const docId = existing?._id ?? `ytclip-${videoId}`

    // Strip Sanity internal fields so createOrReplace doesn't choke
    const preserved = existing
      ? Object.fromEntries(
          Object.entries(existing).filter(
            ([k]) => !['_rev', '_createdAt', '_updatedAt'].includes(k)
          )
        )
      : {}

    const rawTitle = snippet.title ?? `(uten tittel) ${videoId}`
    const title    = existing?.title ?? rawTitle
    const linkLocked = existing?.linkStatus === 'reviewed'

    const doc = {
      ...preserved,
      _id:          docId,
      _type:        'historicalClip',
      youtubeId:    videoId,
      title,
      // A verified/reviewed link is never touched again, even if YouTube's
      // own metadata for this video changes.
      videoUrl:     linkLocked
        ? existing.videoUrl
        : `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: bestThumbnail(snippet.thumbnails) ?? existing?.thumbnailUrl,
      publishedAt:  snippet.publishedAt ?? existing?.publishedAt,
      // Generate a slug if one doesn't already exist (Studio only auto-fills
      // this on manual save — API writes never got one otherwise).
      slug:         existing?.slug ?? { _type: 'slug', current: slugify(title) },
      // Set year from publishedAt only if not already set manually
      year:         existing?.year ?? extractYear(snippet.publishedAt),
      // Set source only if not already set manually
      source:       existing?.source ?? sourceLabel,
      // linkStatus: preserve existing value, set 'unlinked' for new docs only
      linkStatus:   existing?.linkStatus ?? 'unlinked',
    }

    // Remove undefined values (Sanity dislikes them)
    for (const k of Object.keys(doc)) {
      if (doc[k] === undefined) delete doc[k]
    }

    await client.createOrReplace(doc)

    if (existing) {
      updated++
      console.log(`  ↻  ${doc.title.slice(0, 60)} [${videoId}]`)
    } else {
      created++
      console.log(`  +  ${doc.title.slice(0, 60)} [${videoId}]`)
    }
  }

  return { created, updated, skipped }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('1/4  Henter aktive YouTube-kilder fra Sanity…')
const sources = await getActiveSources()
if (!sources.length) {
  console.error('❌  Ingen aktive youtubeSource-dokumenter funnet. Opprett minst én i Studio.')
  process.exit(1)
}
console.log(`     Fant ${sources.length} aktiv(e) kilde(r): ${sources.map(s => s.name).join(', ')}\n`)

let totalCreated = 0, totalUpdated = 0, totalSkipped = 0

for (const source of sources) {
  console.log(`── ${source.name} (${source.channelId}) ──────────────────────────`)

  console.log('2/4  Henter uploads-playlist-ID fra kanal…')
  const playlistId = await getUploadsPlaylistId(source.channelId)
  console.log(`     Playlist: ${playlistId}\n`)

  console.log('3/4  Henter alle videoer (paginert, 50 per side)…')
  const snippets = await fetchAllPlaylistItems(playlistId)
  console.log(`     Fant ${snippets.length} videoer\n`)

  console.log('4/4  Importerer til Sanity…')
  const { created, updated, skipped } = await importClips(snippets, source.sourceLabel)
  totalCreated += created
  totalUpdated += updated
  totalSkipped += skipped

  console.log(`     ${source.name}: ${created} opprettet, ${updated} oppdatert, ${skipped} hoppet over\n`)
}

console.log(`✅  Ferdig — ${totalCreated} opprettet, ${totalUpdated} oppdatert, ${totalSkipped} hoppet over totalt`)
console.log(`    Dataset: ${SANITY_DATASET}`)
