/**
 * patch-biography-shortbio.mjs
 *
 * Applies rewritten shortBio text to biography documents. Input is a JSON
 * array of {_id, shortBio} produced by hand/agent-drafted rewrites (see the
 * "Hvem er hvem" shortBio task: shortBio used to be a truncation of the
 * opening lines of fullBio for ~165 book-sourced entries — this replaces it
 * with an independent summary).
 *
 * Validates shortBio length against the schema's 280-char limit before
 * writing anything. Skips (does not overwrite) any document whose current
 * shortBio no longer matches what was true at draft time only if --check
 * is not passed — by default it always writes the new text.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/patch-biography-shortbio.mjs <input.json> [--dry-run]
 */

import { createClient } from '@sanity/client'
import fs from 'fs'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const inputPath = process.argv[2]
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!inputPath || inputPath.startsWith('--')) {
  console.error('Usage: node scripts/patch-biography-shortbio.mjs <input.json> [--dry-run]')
  process.exit(1)
}
if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN).')
  process.exit(1)
}

const entries = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

const tooLong = entries.filter(e => (e.shortBio ?? '').length > 280)
if (tooLong.length) {
  console.error(`❌ ${tooLong.length} entries exceed 280 characters — aborting. Fix the input first.`)
  for (const e of tooLong) console.error(`  ${e._id}: ${e.shortBio.length} chars`)
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log(`⚠️  Du skriver til PRODUKSJONSDATASETTET (patcher shortBio på ${entries.length} biography-dokumenter). Venter 5 sekunder...`)
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

if (dryRun) {
  console.log(`[dry-run] ville patchet ${entries.length} dokumenter. Eksempel:`)
  console.log(entries.slice(0, 3))
  process.exit(0)
}

const CHUNK = 40
let patched = 0
for (let i = 0; i < entries.length; i += CHUNK) {
  const chunk = entries.slice(i, i + CHUNK)
  let tx = client.transaction()
  for (const { _id, shortBio } of chunk) {
    tx = tx.patch(_id, p => p.set({ shortBio }))
  }
  await tx.commit()
  patched += chunk.length
  console.log(`Patchet ${Math.min(i + CHUNK, entries.length)} / ${entries.length}`)
}

console.log(`Ferdig. ${patched} biography-dokumenter fikk ny shortBio.`)
