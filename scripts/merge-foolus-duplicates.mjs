/**
 * merge-foolus-duplicates.mjs
 *
 * One-off cleanup for a duplication bug in syncFoolUsNordic.mjs: three
 * existing, hand-curated "fool-us" tvAppearance docs had no episode number
 * filled in (only season/year), so the sync's magician+season+episode match
 * key didn't line up with its own newly-scraped entry (which always has an
 * episode number) and it fell through to creating a fresh duplicate instead
 * of recognizing the existing one. For Mortenn Christiansen specifically,
 * the existing biography is filed under the mononymous stage name "Mortenn"
 * alone, which also didn't match Wikipedia's "Mortenn Christiansen" text,
 * duplicating the biography as well as both of his tvAppearance docs.
 *
 * A fourth pair (Brynolf & Ljung vs. the pre-existing "Brynolf, Peter"
 * biography) was a genuine content-identity question, not just a technical
 * duplicate — the user chose to keep the existing individual biography.
 *
 * For each pair below:
 *   - the KEEP document (pre-existing, curated) is patched with any field
 *     named in `fill` that it was missing (never overwriting a set field)
 *   - the DELETE document(s) are removed
 *   - a biography in `deleteBiographies` is removed only after confirming
 *     (via a live reference check) that nothing besides the docs already
 *     being deleted in this run still points to it
 *
 * Safe to re-run: docs that are already gone are skipped.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/merge-foolus-duplicates.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN).')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (patcher 2, sletter 5 dokumenter). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const PAIRS = [
  {
    label: 'Mikael Hedné — S7 2020',
    keepId: 'tvappearance-mikael-hedne-fool-us-s07',
    fill: { episode: 6 },
    deleteAppearances: ['tvappearance-foolus-hedne-s7e6'],
  },
  {
    label: 'Christian Engblom — S5 2018',
    keepId: 'tvappearance-christian-engblom-fool-us-s05',
    fill: { episode: 9 },
    deleteAppearances: ['tvappearance-foolus-christian-engblom-s5e9'],
  },
  {
    label: 'Mortenn Christiansen — S10 2023 + S11 2024',
    keepId: null, // two separate keep docs, no fields to fill
    fill: {},
    deleteAppearances: [
      'tvappearance-foolus-mortenn-christiansen-s10e10',
      'tvappearance-foolus-mortenn-christiansen-s11e12',
    ],
    deleteBiographies: ['biography-foolus-mortenn-christiansen'],
  },
  {
    label: 'Brynolf & Ljung — S1 2011 (kept as "Brynolf, Peter" per editorial decision)',
    keepId: null,
    fill: {},
    deleteAppearances: ['tvappearance-foolus-brynolf-ljung-s1e6'],
    deleteBiographies: ['biography-foolus-brynolf-ljung'],
  },
]

const allAppearanceIds = PAIRS.flatMap(p => [p.keepId, ...p.deleteAppearances].filter(Boolean))
const allBiographyIds = PAIRS.flatMap(p => p.deleteBiographies ?? [])

const appearanceDocs = await client.fetch(`*[_id in $ids]`, { ids: allAppearanceIds })
const byId = new Map(appearanceDocs.map(d => [d._id, d]))

let filled = 0, appearancesDeleted = 0, biosDeleted = 0, biosSkipped = 0, missing = 0

console.log(`${dryRun ? '[dry-run] ' : ''}1/2  Behandler ${PAIRS.length} par…\n`)

const tx = client.transaction()

for (const pair of PAIRS) {
  console.log(`▶ ${pair.label}`)

  if (pair.keepId) {
    const keep = byId.get(pair.keepId)
    if (!keep) {
      console.log(`  ⚠️  Mangler keep-dokument ${pair.keepId} — hopper over utfylling.`)
      missing++
    } else {
      const patch = {}
      for (const [k, v] of Object.entries(pair.fill)) {
        if (keep[k] == null) patch[k] = v
      }
      if (Object.keys(patch).length) {
        console.log(`  ↻  Fyller ut ${JSON.stringify(patch)} på ${pair.keepId}`)
        if (!dryRun) tx.patch(pair.keepId, p => p.set(patch))
        filled++
      } else {
        console.log(`  ·  ${pair.keepId} trenger ingen utfylling.`)
      }
    }
  }

  for (const dupId of pair.deleteAppearances) {
    if (!byId.get(dupId)) {
      console.log(`  ·  ${dupId} finnes ikke lenger (allerede ryddet).`)
      continue
    }
    console.log(`  ✂️  Sletter duplikat ${dupId}`)
    if (!dryRun) tx.delete(dupId)
    appearancesDeleted++
  }

  console.log('')
}

if (!dryRun) await tx.commit()

console.log(`${dryRun ? '[dry-run] ' : ''}2/2  Sjekker og sletter overflødige biography-dokumenter…\n`)

for (const bioId of allBiographyIds) {
  const referencingDocs = await client.fetch(
    `*[references($id) && !(_id in $excluded)]{_id, _type}`,
    { id: bioId, excluded: allAppearanceIds }
  )
  if (referencingDocs.length) {
    console.log(`  ⚠️  ${bioId} refereres fortsatt av ${referencingDocs.length} dokument(er) — hopper over sletting:`)
    referencingDocs.forEach(d => console.log(`      ${d._type}/${d._id}`))
    biosSkipped++
    continue
  }
  console.log(`  ✂️  Sletter overflødig biography ${bioId}`)
  if (!dryRun) await client.delete(bioId)
  biosDeleted++
}

console.log(`\n✅  ${dryRun ? '[dry-run] ' : ''}Ferdig — ${filled} felt fylt ut, ${appearancesDeleted} tvAppearance-duplikat(er) slettet, ` +
  `${biosDeleted} biography-duplikat(er) slettet (${biosSkipped} hoppet over pga. andre referanser), ${missing} keep-dokument(er) manglet.`)
console.log(`    Dataset: ${dataset}`)
