/**
 * migrate-biography-sources.mjs
 *
 * Converts biography.sources[] from embedded `sourceItem` objects (free-text
 * label + optional url) into references to standalone `source` documents
 * (see schemaTypes/source.ts). This lets kilder be looked up / reused
 * instead of retyped in every biography.
 *
 * Step 1: scans every biography doc, groups sourceItem entries by exact
 *         label text, and creates one `source` document per unique label
 *         (deterministic _id: source-<slug of label>). The dominant label
 *         "Magiens Hvem er Hvem — Terje Nordheim (2005)" becomes a single
 *         shared `source` doc referenced by ~170 biographies.
 * Step 2: patches each biography doc's `sources` field to an array of
 *         `reference` objects pointing at those `source` docs.
 *
 * Non-destructive in spirit but DOES rewrite the `sources` field shape on
 * every biography document that has one — this is the schema migration the
 * field-type change in schemaTypes/biography.ts requires. Safe to re-run:
 * source docs use deterministic _ids (createOrReplace), and the patch step
 * is idempotent (recomputes the same reference list each time).
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/migrate-biography-sources.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/migrate-biography-sources.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter source-dokumenter og patcher biography.sources). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
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

// Best-effort split of "Title — Author (Year)" style labels into fields.
function parseLabel(label) {
  const m = label.match(/^(.*?)\s*—\s*(.*?)\s*\((\d{4})\)\s*$/)
  if (m) return { title: label, author: m[2], year: Number(m[3]) }
  return { title: label }
}

const docs = await client.fetch(`
  *[_type == "biography" && defined(sources) && count(sources) > 0]{
    _id, sources[]{ _key, _type, label, url }
  }
`)

console.log(`Fant ${docs.length} biography-dokumenter med kilder.`)

// ── Steg 1: unike kilde-labels → source-dokumenter ──────────────────────
const byLabel = new Map()
for (const doc of docs) {
  for (const s of doc.sources ?? []) {
    if (!s.label) continue
    if (!byLabel.has(s.label)) byLabel.set(s.label, { label: s.label, url: s.url })
  }
}

console.log(`${byLabel.size} unike kilde-labels funnet.`)

const sourceIdByLabel = new Map()
let tx = client.transaction()
for (const [label, { url }] of byLabel) {
  const id = `source-${slugifyLabel(label)}`
  sourceIdByLabel.set(label, id)
  const { title, author, year } = parseLabel(label)
  const doc = {
    _id: id,
    _type: 'source',
    title,
    ...(author ? { author } : {}),
    ...(year ? { year } : {}),
    ...(url ? { url } : {}),
  }
  console.log(dryRun ? `[dry-run] ville opprettet ${id}: "${title}"` : `Oppretter ${id}: "${title}"`)
  if (!dryRun) tx = tx.createOrReplace(doc)
}
if (!dryRun) await tx.commit()

// ── Steg 2: patch hver biography.sources[] til referanser ──────────────
// Already-migrated reference entries are passed through unchanged (not
// dropped) — this is what makes re-running the script safe.
let patched = 0
let skipped = 0
for (const doc of docs) {
  const items = doc.sources ?? []
  const alreadyAllRefs = items.every(s => s._type === 'reference')
  if (alreadyAllRefs) { skipped++; continue }

  const refs = items.map(s => {
    if (s._type === 'reference') return s
    if (s.label && sourceIdByLabel.has(s.label)) {
      return { _key: s._key, _type: 'reference', _ref: sourceIdByLabel.get(s.label) }
    }
    return null
  }).filter(Boolean)

  if (dryRun) {
    console.log(`[dry-run] ville patchet ${doc._id} med ${refs.length} kilde-referanse(r)`)
    continue
  }
  await client.patch(doc._id).set({ sources: refs }).commit()
  patched++
}

console.log(dryRun
  ? `[dry-run] ferdig. Ingen skriving utført.`
  : `Ferdig. ${sourceIdByLabel.size} source-dokumenter opprettet/oppdatert, ${patched} biography-dokumenter patchet, ${skipped} allerede migrert (uendret).`)
