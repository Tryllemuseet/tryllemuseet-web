/**
 * patch-tvappearance-video-urls.mjs
 *
 * Adds videoUrl to existing tvAppearance documents that were missing it.
 * URLs were sourced by web search and manually reviewed against the show's
 * official "fooled"/"not_fooled" verdicts before being added here (see the
 * "Digital innholdsintegrasjon" mapping doc, Aug 2026). Some entries are the
 * best available candidate rather than a 100%-confirmed match (Vegard
 * Johansen, Labib Malik) — flagged with a comment below.
 *
 * Only sets videoUrl on documents that don't already have one, so re-running
 * is safe and won't clobber manual edits made later in Studio.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/patch-tvappearance-video-urls.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN).')
  process.exit(1)
}

const entries = [
  { _id: 'tvappearance-rune-carlsen-fool-us-s10e02', videoUrl: 'https://www.youtube.com/watch?v=BV31EjktWuY' },
  { _id: 'tvappearance-rune-carlsen-norske-talenter-2018', videoUrl: 'https://www.youtube.com/watch?v=BWgbVlmdqOQ' },
  { _id: 'tvappearance-rune-carlsen-talang-2020', videoUrl: 'https://www.youtube.com/watch?v=0wpm8AyRV6Y' },
  { _id: 'tvappearance-mikael-hedne-fool-us-s07', videoUrl: 'https://www.youtube.com/watch?v=_wrtMH10gTM' },
  { _id: 'tvappearance-tom-henning-thorsen-norske-talenter-2017', videoUrl: 'https://www.youtube.com/watch?v=_J7Km3n6U2c' },
  { _id: 'tvappearance-guilherme-curty-norske-talenter-2014', videoUrl: 'https://www.youtube.com/watch?v=4_clWepcmio' },
  { _id: 'tvappearance-daniel-larsen-norske-talenter-2008', videoUrl: 'https://www.youtube.com/watch?v=4S73Yv0QAEA' },
  // Best candidate, not fully confirmed — audition clip; video title suggests
  // he may have gone on to the semifinal despite the doc's "participant" result.
  { _id: 'tvappearance-vegard-johansen-norske-talenter-2023', videoUrl: 'https://www.youtube.com/watch?v=4J1Sjt4IJbw' },
  // Best candidate, not fully confirmed — plausible match on name + show, season not verified.
  { _id: 'tvappearance-labib-malik-norske-talenter-2017', videoUrl: 'https://www.youtube.com/watch?v=5Y-nuRgjTgE' },
]

if (dataset === 'production' && !dryRun) {
  console.log(`⚠️  Du skriver til PRODUKSJONSDATASETTET (patcher videoUrl på inntil ${entries.length} tvAppearance-dokumenter). Venter 5 sekunder...`)
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const existing = await client.fetch(
  `*[_id in $ids]{_id, videoUrl}`,
  { ids: entries.map(e => e._id) }
)
const existingById = new Map(existing.map(d => [d._id, d]))

const missing = entries.filter(e => !existingById.has(e._id))
if (missing.length) {
  console.error('❌ Fant ikke disse dokumentene i datasettet:')
  for (const m of missing) console.error(`  ${m._id}`)
  process.exit(1)
}

const toPatch = entries.filter(e => !existingById.get(e._id).videoUrl)
const alreadySet = entries.length - toPatch.length
if (alreadySet) {
  console.log(`↷ ${alreadySet} dokument(er) har allerede videoUrl — hopper over.`)
}

if (dryRun) {
  console.log(`[dry-run] ville patchet ${toPatch.length} dokumenter:`)
  for (const e of toPatch) console.log(`  ${e._id} -> ${e.videoUrl}`)
  process.exit(0)
}

if (!toPatch.length) {
  console.log('Ingenting å gjøre.')
  process.exit(0)
}

let tx = client.transaction()
for (const { _id, videoUrl } of toPatch) {
  tx = tx.patch(_id, p => p.set({ videoUrl }))
}
await tx.commit()

console.log(`Ferdig. ${toPatch.length} tvAppearance-dokumenter fikk ny videoUrl.`)
