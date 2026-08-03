/**
 * migrate-qrnumber-to-qrcode.mjs
 *
 * Moves the QR-code table from an embedded `legend.qrNumber` field into
 * standalone `qrCode` documents (schemaTypes/qrCode.ts) that reference the
 * `legend` doc they point to. This gives editors one browsable list of all
 * QR codes in Sanity Studio instead of having to open every Fordypning
 * document to check which numbers are in use.
 *
 * Step 1: finds every legend doc (published, deduped against any draft
 *         counterpart) with a defined qrNumber.
 * Step 2: creates one qrCode document per number, with a deterministic
 *         _id (qrCode-<number>) and a reference to the legend doc. Safe to
 *         re-run (createOrReplace).
 * Step 3: unsets qrNumber on the source legend doc (both published and
 *         draft, if a draft exists) — the field is being removed from the
 *         legend schema, so this clears the now-orphaned data.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/migrate-qrnumber-to-qrcode.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/migrate-qrnumber-to-qrcode.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter qrCode-dokumenter, fjerner legend.qrNumber). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const docs = await client.fetch(`
  *[_type == "legend" && defined(qrNumber) && !(_id in path("drafts.**"))] {
    _id, title, qrNumber, "slug": slug.current
  } | order(qrNumber asc)
`)

const draftIds = new Set(
  await client.fetch(`*[_id in $ids]._id`, { ids: docs.map(d => `drafts.${d._id}`) })
)

console.log(`Fant ${docs.length} legend-dokument(er) med qrNumber:`)
for (const doc of docs) {
  console.log(`  - #${doc.qrNumber}: ${doc._id} (${doc.title}) → qrCode-${doc.qrNumber}`)
}

if (dryRun) {
  console.log('\n--dry-run: ingen endringer skrevet.')
  process.exit(0)
}

if (docs.length === 0) {
  console.log('\nIngenting å gjøre.')
  process.exit(0)
}

const tx = client.transaction()
for (const doc of docs) {
  tx.createOrReplace({
    _id: `qrCode-${doc.qrNumber}`,
    _type: 'qrCode',
    qrNumber: doc.qrNumber,
    target: { _type: 'reference', _ref: doc._id },
  })
  tx.patch(doc._id, p => p.unset(['qrNumber']))
  if (draftIds.has(`drafts.${doc._id}`)) {
    tx.patch(`drafts.${doc._id}`, p => p.unset(['qrNumber']))
  }
}
await tx.commit()

console.log(`\n✅ Opprettet ${docs.length} qrCode-dokument(er) og ryddet legend.qrNumber.`)
