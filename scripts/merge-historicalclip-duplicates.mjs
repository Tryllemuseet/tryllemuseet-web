/**
 * merge-historicalclip-duplicates.mjs
 *
 * One-off cleanup for the historicalClip duplication bug: importYouTubeClips.mjs
 * used to match existing documents by _id (`ytclip-<videoId>`), which never
 * found the hand-curated `historicalclip-<slug>` documents (they predate the
 * youtubeId field and have a different _id scheme). Every daily sync run
 * therefore created a fresh `ytclip-*` shadow document instead of updating the
 * curated one, leaving 38 documents in production for ~22 actual videos.
 *
 * This script was built from a manual title-by-title comparison of every
 * historicalclip-* and ytclip-* document in production (see the PAIRS table
 * below). For each pair:
 *   - the curated historicalclip-* document is kept (title, slug, year,
 *     description, editorial fields untouched)
 *   - youtubeId, videoUrl, thumbnailUrl, publishedAt are backfilled from the
 *     ytclip-* duplicate (in two cases — Finn Jon "Kanal 1" and Erling
 *     Solland "I Magiens Verden, del 1" — the channel's current upload has a
 *     different video ID than the curated link, so this also corrects a
 *     stale/wrong YouTube link)
 *   - the ytclip-* duplicate is then deleted
 *
 * The remaining ytclip-* documents (STANDALONE below) have no curated
 * counterpart — they're kept as-is, just given a slug if they don't have one,
 * matching what importYouTubeClips.mjs now does automatically going forward.
 *
 * Safe to re-run: pairs where the ytclip-* side is already gone are skipped.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/merge-historicalclip-duplicates.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/merge-historicalclip-duplicates.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (patcher 16 dokumenter, sletter 16 duplikater, patcher 3 slugger). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

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

// keep._id → duplicate._id (both historicalClip documents referring to the same video)
const PAIRS = [
  ['historicalclip-arnsteino-frokost-tv-nrk',                       'ytclip-PO6VoTun7xs'],
  ['historicalclip-egelo-melodi-grand-prix-1966',                   'ytclip-4XE5Qhzb5FQ'],
  ['historicalclip-erling-solland-bettan-sputnik-1993',             'ytclip-M5KQh3pF_Fs'],
  ['historicalclip-erling-solland-da-capo-lille-julaften-1996',     'ytclip-BND5Kpl1xGw'],
  ['historicalclip-erling-solland-froken-norge-1994',                'ytclip-Yb4W2ygf10g'],
  ['historicalclip-erling-solland-i-magiens-verden-del1-2006',       'ytclip-j1qWHJ9jKN8'], // video ID differs — channel re-uploaded, ytclip has the current one
  ['historicalclip-erling-solland-kalle-og-molo-2006',                'ytclip-GuHMFWocVKs'],
  ['historicalclip-erling-solland-scantertainment-wenche-myhre-1986','ytclip-F9gzPrx4qMg'],
  ['historicalclip-erling-solland-stena-saga-sommershow-1999',       'ytclip-UUwgYgfbqos'],
  ['historicalclip-finn-jon-kanal-1-1985',                           'ytclip-_zwrb0I6Dgc'], // video ID differs — channel re-uploaded, ytclip has the current one
  ['historicalclip-finn-jon-lordagskveld-erik-bye-1971',             'ytclip-RsAH061FGxU'],
  ['historicalclip-fortryllende-magitreff-1982',                     'ytclip-S7pmf6qhAE8'],
  ['historicalclip-mcn-magisk-festival-1976',                        'ytclip-Lpaw_F7Xmk0'],
  ['historicalclip-nordisk-mesterskap-trylling-1955',                'ytclip-eA0rBgSCxL0'],
  ['historicalclip-simono-for-galleriet-1992',                       'ytclip-ZfnSGBdAba4'],
  ['historicalclip-tore-torell-sommerkveld-studio-1-1974',           'ytclip-Do1t0oYNRTM'],
]

// ytclip-* documents with no curated counterpart — kept standalone, just need a slug
const STANDALONE = [
  'ytclip-0pOIFX31BGQ',
  'ytclip-0xkilcnNbS4',
  'ytclip-Ew9cZSjw5uo',
  'ytclip-IdipT5Bo1Zc',
  'ytclip-Ql-Q0IN6wfQ',
  'ytclip-_egD-5waEyk',
]

const allIds = [...PAIRS.flat(), ...STANDALONE]
const docs = await client.fetch(`*[_id in $ids]`, { ids: allIds })
const byId = new Map(docs.map(d => [d._id, d]))

let merged = 0, mergedSkipped = 0, slugsFilled = 0, patchedNoop = 0

console.log(`${dryRun ? '[dry-run] ' : ''}1/2  Slår sammen ${PAIRS.length} par…\n`)

const tx = client.transaction()

for (const [keepId, dupId] of PAIRS) {
  const keep = byId.get(keepId)
  const dup  = byId.get(dupId)

  if (!keep) { console.log(`  ⚠️  Mangler ${keepId} — hopper over paret.`); mergedSkipped++; continue }
  if (!dup)  { console.log(`  ·  ${dupId} finnes ikke lenger (allerede ryddet) — hopper over.`); mergedSkipped++; continue }

  const videoId = dup.youtubeId ?? dup._id.replace(/^ytclip-/, '')
  const patch = {
    youtubeId:    videoId,
    videoUrl:     dup.videoUrl ?? keep.videoUrl,
    thumbnailUrl: keep.thumbnailUrl ?? dup.thumbnailUrl,
    publishedAt:  keep.publishedAt ?? dup.publishedAt,
  }
  for (const k of Object.keys(patch)) if (patch[k] === undefined) delete patch[k]

  const changedLink = keep.videoUrl !== patch.videoUrl
  console.log(`  ↻  ${keep.title.slice(0, 55)}  [${keepId}]${changedLink ? `  ⚠️  videoUrl endret (${keep.videoUrl} → ${patch.videoUrl})` : ''}`)

  if (!dryRun) {
    tx.patch(keepId, p => p.set(patch))
    tx.delete(dupId)
  }
  merged++
}

console.log(`\n${dryRun ? '[dry-run] ' : ''}2/2  Genererer slug for frittstående dokumenter uten et…\n`)

for (const id of STANDALONE) {
  const doc = byId.get(id)
  if (!doc) { console.log(`  ⚠️  Mangler ${id} — hopper over.`); continue }
  if (doc.slug?.current) { console.log(`  ·  ${id} har allerede slug "${doc.slug.current}".`); patchedNoop++; continue }

  const slug = slugify(doc.title)
  console.log(`  +  ${doc.title.slice(0, 55)}  [${id}] → slug "${slug}"`)
  if (!dryRun) tx.patch(id, p => p.set({ slug: { _type: 'slug', current: slug } }))
  slugsFilled++
}

if (!dryRun) {
  await tx.commit()
}

console.log(`\n✅  ${dryRun ? '[dry-run] ' : ''}Ferdig — ${merged} par slått sammen (${mergedSkipped} hoppet over), ${slugsFilled} slugger generert (${patchedNoop} hadde allerede slug).`)
console.log(`    Dataset: ${dataset}`)
