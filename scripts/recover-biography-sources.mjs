/**
 * recover-biography-sources.mjs — ONE-OFF INCIDENT FIX, not a general migration.
 *
 * migrate-biography-sources.mjs was run twice (once for the initial pass,
 * once to pick up 8 stragglers a first partial run hadn't reached). The
 * second run refetched sources[]{label,url} for ALL biography docs — for
 * the ~165 already converted to reference-type sources in the first run,
 * `label`/`url` no longer exist (they're references, not sourceItem
 * objects), so the script computed an empty ref list and overwrote
 * `sources` with [] on all of them.
 *
 * This script recovers the original sourceItem labels for every biography
 * doc whose `sources` is currently an empty array, using Sanity's document
 * History API (state as of 2026-07-28T20:00:00Z, before any of today's
 * migration transactions ran), then re-applies the same label → `source`
 * document mapping migrate-biography-sources.mjs used to rebuild the
 * correct reference array.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/recover-biography-sources.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN
const RECOVERY_TIME = '2026-07-28T20:00:00.000Z' // before any of today's migration transactions

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN.')
  process.exit(1)
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

function slugifyLabel(label) {
  return label
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const emptyDocs = await client.fetch(`
  *[_type == "biography" && defined(sources) && count(sources) == 0]{ _id, name }
`)
console.log(`${emptyDocs.length} biography-dokumenter har tom sources[] nå — henter historisk data for hver.`)

let recovered = 0
let alreadyEmptyInHistory = 0
const failures = []

for (const doc of emptyDocs) {
  let historicSources
  try {
    const res = await client.request({
      url: `/data/history/production/documents/${doc._id}`,
      query: { time: RECOVERY_TIME },
    })
    historicSources = res.documents?.[0]?.sources
  } catch (e) {
    failures.push({ id: doc._id, name: doc.name, error: e.message })
    continue
  }

  if (!historicSources || historicSources.length === 0) {
    alreadyEmptyInHistory++
    continue
  }

  const refs = historicSources
    .filter(s => s.label)
    .map(s => ({ _key: s._key, _type: 'reference', _ref: `source-${slugifyLabel(s.label)}` }))

  if (refs.length === 0) continue

  console.log(`${dryRun ? '[dry-run] ' : ''}${doc._id} (${doc.name}) ← ${refs.map(r => r._ref).join(', ')}`)
  if (!dryRun) {
    await client.patch(doc._id).set({ sources: refs }).commit()
  }
  recovered++
}

console.log(`Ferdig. ${recovered} dokumenter ${dryRun ? 'ville blitt' : 'ble'} gjenopprettet, ${alreadyEmptyInHistory} hadde ingen kilder også historisk, ${failures.length} feilet.`)
if (failures.length) console.log(JSON.stringify(failures, null, 2))
