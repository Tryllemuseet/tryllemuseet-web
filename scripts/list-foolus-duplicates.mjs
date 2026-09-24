/**
 * list-foolus-duplicates.mjs
 *
 * Read-only diagnostic: dumps every "fool-us" tvAppearance in full (season,
 * episode, year, result, videoUrl/videoRef, editorNote), grouped by magician,
 * plus a flag on any group with more than one distinct magician _id sharing
 * a token-sorted, diacritics-stripped name (catches Wikipedia's "First Last"
 * vs. this site's "Last, First" biography.name convention producing two
 * separate biography docs for the same person). A magician with several
 * appearances is not itself a bug (returning performers exist), so this
 * prints everything for a human to eyeball rather than guessing which
 * repeats are real duplicates.
 *
 * Makes no writes. Usage:
 *   SANITY_TOKEN=<token> node scripts/list-foolus-duplicates.mjs
 */

import { createClient } from '@sanity/client'

const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN
if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN).')
  process.exit(1)
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

function tokenKey(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[(),]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}

const appearances = await client.fetch(`
  *[_type == "tvAppearance" && show == "fool-us"]{
    _id, slug, season, episode, year, result, videoUrl, videoRef, editorNote, isVisible,
    "magicianId": magician._ref,
    "magicianName": magician->name,
    "magicianArtistName": magician->artistName,
    "magicianNeedsUpdate": magician->needsUpdate,
  } | order(magicianName asc)
`)

console.log(`Fant ${appearances.length} "fool-us"-opptreden(er) totalt.\n`)

const groups = new Map()
for (const a of appearances) {
  const key = tokenKey(a.magicianArtistName || a.magicianName || '(ukjent)')
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(a)
}

console.log(`1/2  Full liste, gruppert per magiker (${groups.size} unike navn):\n`)
for (const [key, items] of groups) {
  const distinctMagicianIds = new Set(items.map(i => i.magicianId))
  const flag = items.length > 1 ? (distinctMagicianIds.size > 1 ? '  ⚠️ ULIKE magician-dokumenter!' : '  (samme magiker, flere opptredener)') : ''
  console.log(`▶ "${key}"${flag}`)
  for (const a of items) {
    console.log(
      `    [${a._id}]  slug=${a.slug?.current ?? '–'}  magician=${a.magicianId}` +
      `${a.magicianNeedsUpdate ? ' [needsUpdate]' : ''}${a.isVisible === false ? ' [SKJULT]' : ''}\n` +
      `      S${a.season ?? '?'}E${a.episode ?? '?'} (${a.year ?? '?'}) → ${a.result}` +
      `  videoUrl=${a.videoUrl ?? '–'}  videoRef=${a.videoRef?._ref ?? '–'}` +
      `${a.editorNote ? `\n      editorNote: ${a.editorNote}` : ''}`
    )
  }
  console.log('')
}

const dupGroups = [...groups.values()].filter(items => new Set(items.map(i => i.magicianId)).size > 1).length
console.log(`2/2  ${dupGroups
  ? `❌  ${dupGroups} gruppe(r) med ULIKE magician-dokumenter under samme navn.`
  : '✅  Ingen grupper med ulike magician-dokumenter under samme navn.'}`)
