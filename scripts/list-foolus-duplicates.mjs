/**
 * list-foolus-duplicates.mjs
 *
 * Read-only diagnostic: lists every "fool-us" tvAppearance together with its
 * magician, grouped by a loose token-based key (lowercased, diacritics
 * stripped, words sorted) so name-order differences — e.g. Wikipedia's
 * "Mortenn Christiansen" vs. this site's "Christiansen, Mortenn" convention
 * (see biography.name's own field description) — still land in the same
 * group. Any group with more than one distinct magician _id is a likely
 * duplicate created by syncFoolUsNordic.mjs failing to match an existing,
 * differently-formatted biography.
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
    _id, season, episode, year, result, videoUrl, videoRef, editorNote,
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

let dupGroups = 0
for (const [key, items] of groups) {
  const distinctMagicianIds = new Set(items.map(i => i.magicianId))
  if (distinctMagicianIds.size < 2) continue
  dupGroups++
  console.log(`⚠️  Mulig duplikat: "${key}" (${distinctMagicianIds.size} ulike magician-dokumenter)`)
  for (const a of items) {
    console.log(
      `    [${a._id}]  magician=${a.magicianId} (${a.magicianName}` +
      `${a.magicianArtistName ? ` / ${a.magicianArtistName}` : ''})` +
      `${a.magicianNeedsUpdate ? ' [needsUpdate]' : ''}\n` +
      `      S${a.season ?? '?'}E${a.episode ?? '?'} (${a.year ?? '?'}) → ${a.result}` +
      `  videoUrl=${a.videoUrl ?? '–'}  videoRef=${a.videoRef?._ref ?? '–'}`
    )
  }
  console.log('')
}

console.log(dupGroups
  ? `\n❌  ${dupGroups} gruppe(r) med sannsynlige duplikater funnet — se over.`
  : '\n✅  Ingen duplikater funnet blant "fool-us"-opptredener.')
