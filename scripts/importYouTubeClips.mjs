/**
 * importYouTubeClips.mjs
 *
 * Fetches all public videos from @Egelosvideosamling and upserts them as
 * historicalClip documents in Sanity using createOrReplace().
 *
 * _id format: ytclip-<youtubeId>  (stable, idempotent across runs)
 *
 * Editorial fields (magician, slug, description, linkStatus after manual
 * update, etc.) are preserved on existing documents — only YouTube-sourced
 * metadata is refreshed.
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

const CHANNEL_ID   = 'UCZnMLahgXe6-CDXSUnQWy7A'  // @Egelosvideosamling
const PROJECT_ID   = 'n2ynpgty'
const API_VERSION  = '2024-01-01'

const YT_API_KEY     = process.env.YOUTUBE_API_KEY
const SANITY_TOKEN   = process.env.SANITY_TOKEN
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

console.log(`📡  Dataset: ${SANITY_DATASET} | Kanal: ${CHANNEL_ID}\n`)

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

// ── Import logic ──────────────────────────────────────────────────────────────

async function importClips(snippets) {
  let created = 0
  let updated = 0
  let skipped = 0

  for (const snippet of snippets) {
    const videoId = snippet.resourceId?.videoId
    if (!videoId) { skipped++; continue }

    const docId = `ytclip-${videoId}`

    // Fetch existing to preserve editorial fields
    const existing = await client.fetch(
      `*[_id == $id][0]`,
      { id: docId }
    )

    // Strip Sanity internal fields so createOrReplace doesn't choke
    const preserved = existing
      ? Object.fromEntries(
          Object.entries(existing).filter(
            ([k]) => !['_rev', '_createdAt', '_updatedAt'].includes(k)
          )
        )
      : {}

    const doc = {
      ...preserved,
      // Always overwrite these from YouTube
      _id:          docId,
      _type:        'historicalClip',
      youtubeId:    videoId,
      title:        snippet.title ?? `(uten tittel) ${videoId}`,
      videoUrl:     `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: bestThumbnail(snippet.thumbnails) ?? undefined,
      publishedAt:  snippet.publishedAt ?? undefined,
      // Set year from publishedAt only if not already set manually
      year:         existing?.year ?? extractYear(snippet.publishedAt),
      // Set source only if not already set manually
      source:       existing?.source ?? 'Egelos videosamling (@Egelosvideosamling)',
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

console.log('1/3  Henter uploads-playlist-ID fra kanal…')
const playlistId = await getUploadsPlaylistId(CHANNEL_ID)
console.log(`     Playlist: ${playlistId}\n`)

console.log('2/3  Henter alle videoer (paginert, 50 per side)…')
const snippets = await fetchAllPlaylistItems(playlistId)
console.log(`     Fant ${snippets.length} videoer\n`)

console.log('3/3  Importerer til Sanity…')
const { created, updated, skipped } = await importClips(snippets)

console.log(`\n✅  Ferdig — ${created} opprettet, ${updated} oppdatert, ${skipped} hoppet over`)
console.log(`    Dataset: ${SANITY_DATASET}`)
