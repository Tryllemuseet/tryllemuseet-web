/**
 * setup-heh-sources.mjs
 *
 * Sets up the new `source` registry (see schemaTypes/source.ts) for "Hvem er
 * hvem": creates one source document for Terje Nordheim's «Magiens Hvem er
 * Hvem» (2005) — the book almost every biography.sources entry currently
 * cites as a free-text label — and links existing sourceItem entries on
 * `biography` and `legend` documents to it wherever the label clearly
 * refers to that book.
 *
 * Non-destructive: only ADDS a `sourceRef` to matching sourceItem entries.
 * Existing `label`/`url` values are left untouched (so nothing breaks if a
 * page hasn't been redeployed with the sourceRef-aware rendering yet).
 * Skips any entry that already has a sourceRef. Safe to run multiple times.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/setup-heh-sources.mjs
 *   SANITY_TOKEN=<token> SANITY_DATASET=production node scripts/setup-heh-sources.mjs
 *
 * Hent token fra sanity.io/manage → prosjekt → API → Tokens (editor-tilgang).
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'

if (!process.env.SANITY_TOKEN) {
  console.error('❌ Mangler SANITY_TOKEN. Kjør: SANITY_TOKEN=<token> node scripts/setup-heh-sources.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter én ny kilde og legger til sourceRef på eksisterende kildeoppføringer — ingenting slettes). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

const NORDHEIM_SOURCE_ID = 'source-nordheim-heh-2005'

const NORDHEIM_LABEL_PATTERN = /nordheim|magiens hvem er hvem/i

async function ensureNordheimSource() {
  await client.createIfNotExists({
    _id: NORDHEIM_SOURCE_ID,
    _type: 'source',
    title: 'Magiens Hvem er Hvem',
    author: 'Terje Nordheim',
    type: 'book',
    year: 2005,
    note: 'Hovedkilde for de fleste eldre biografiene i registeret. Dekker norske tryllekunstnere frem til ca. år 2000.',
  })
  console.log(`✔ Kilde klar: ${NORDHEIM_SOURCE_ID}`)
}

async function linkMatchingSourceItems(docType) {
  const docs = await client.fetch(
    `*[_type == $docType && count(sources[defined(label) && !defined(sourceRef)]) > 0] { _id, sources }`,
    { docType }
  )

  let patchedDocs = 0
  let patchedItems = 0

  for (const doc of docs) {
    const patch = client.patch(doc._id)
    let changed = false

    doc.sources.forEach((item, i) => {
      if (item.sourceRef || !item.label) return
      if (!NORDHEIM_LABEL_PATTERN.test(item.label)) return
      patch.set({ [`sources[${i}].sourceRef`]: { _type: 'reference', _ref: NORDHEIM_SOURCE_ID } })
      changed = true
      patchedItems++
    })

    if (changed) {
      await patch.commit()
      patchedDocs++
    }
  }

  console.log(`✔ ${docType}: ${patchedItems} kildeoppføring(er) koblet på ${patchedDocs} dokument(er)`)
}

await ensureNordheimSource()
await linkMatchingSourceItems('biography')
await linkMatchingSourceItems('legend')

console.log('✅ Ferdig.')
