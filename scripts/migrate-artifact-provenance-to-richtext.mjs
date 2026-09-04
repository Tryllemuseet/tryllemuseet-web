/**
 * migrate-artifact-provenance-to-richtext.mjs
 *
 * `artifact.provenance` changed from a plain `text` field to an array of
 * Portable Text blocks (richBlockContent — bold/italic/links/inline images),
 * matching the rest of the "longer text" fields across the schema (see
 * schemaTypes/artifact.ts and the richBlockContent-support audit).
 *
 * This wraps each existing plain-string `provenance` value into one Portable
 * Text block per blank-line-separated paragraph, so the field keeps working
 * immediately in Studio and on the site without any editor having to
 * manually retype anything. No text is changed — only re-wrapped.
 *
 * Idempotent: skips documents where `provenance` is already an array
 * (i.e. already migrated), unless run with --force.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/migrate-artifact-provenance-to-richtext.mjs [--dry-run] [--force]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/migrate-artifact-provenance-to-richtext.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (konverterer artifact.provenance til riktekst). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

function textToBlocks(text, keyPrefix) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map((paragraph, i) => ({
      _type: 'block',
      _key: `${keyPrefix}-${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `${keyPrefix}-${i}-s`, text: paragraph, marks: [] }],
    }))
}

async function run() {
  const docs = await client.fetch(`
    *[_type == "artifact" && defined(provenance) && !(_id in path("drafts.**"))]{
      _id, title, provenance
    }
  `)

  const toPatch = docs.filter(d => typeof d.provenance === 'string' && d.provenance.trim() || (force && typeof d.provenance === 'string'))
  const alreadyArray = docs.length - docs.filter(d => typeof d.provenance === 'string').length

  console.log(`Fant ${docs.length} artifact-dokumenter med provenance.`)
  console.log(`${alreadyArray} er allerede riktekst (array) — hoppes over.`)
  console.log(`${toPatch.length} har fortsatt ren tekst og vil bli konvertert.`)

  if (toPatch.length === 0) {
    console.log('Ingenting å gjøre.')
    return
  }

  if (dryRun) {
    console.log('\n--dry-run: eksempler på hva som ville blitt skrevet:')
    for (const d of toPatch.slice(0, 5)) {
      console.log(`  - ${d.title} (${d._id}):`)
      console.log('   ', JSON.stringify(textToBlocks(d.provenance, 'prov')))
    }
    return
  }

  const CHUNK = 40
  for (let i = 0; i < toPatch.length; i += CHUNK) {
    const chunk = toPatch.slice(i, i + CHUNK)
    let tx = client.transaction()
    for (const d of chunk) {
      tx = tx.patch(d._id, p => p.set({ provenance: textToBlocks(d.provenance, `prov-${d._id.slice(-6)}`) }))
    }
    await tx.commit()
    console.log(`Patchet ${Math.min(i + CHUNK, toPatch.length)} / ${toPatch.length}`)
  }

  console.log('\n✅ Ferdig.')
}

run().catch(err => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
