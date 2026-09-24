/**
 * migrate-historisk-klipp-rewritten-text-to-richtext.mjs
 *
 * `historiskeKlippNb.rewrittenText` — the museum's own retelling of each
 * historical newspaper article, and the thing visitors actually read in the
 * archive modal (see web/src/pages/tryllehistorie/historiske-artikler) —
 * changed from a plain `text` field to an array of Portable Text blocks
 * (richBlockContent), so editors can add links and inline images. The page
 * now pre-renders it to HTML server-side via portableTextToHtml() instead
 * of splitting the raw string on blank lines client-side.
 *
 * This wraps each existing plain-string value into one Portable Text block
 * per blank-line-separated paragraph — the same paragraph boundaries the
 * old client-side code used — so nothing changes visually. No text is
 * changed, only re-wrapped.
 *
 * Idempotent: skips documents where `rewrittenText` is already an array,
 * unless run with --force.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/migrate-historisk-klipp-rewritten-text-to-richtext.mjs [--dry-run] [--force]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/migrate-historisk-klipp-rewritten-text-to-richtext.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (konverterer historiskeKlippNb.rewrittenText til riktekst). Venter 5 sekunder...')
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
    *[_type == "historiskeKlippNb" && defined(rewrittenText) && !(_id in path("drafts.**"))]{
      _id, title, rewrittenText
    }
  `)

  const stillString = docs.filter(d => typeof d.rewrittenText === 'string')
  const toPatch = force ? stillString : stillString.filter(d => d.rewrittenText.trim())

  console.log(`Fant ${docs.length} historiskeKlippNb-dokumenter med rewrittenText.`)
  console.log(`${docs.length - stillString.length} er allerede riktekst (array) — hoppes over.`)
  console.log(`${toPatch.length} har fortsatt ren tekst og vil bli konvertert.`)

  if (toPatch.length === 0) {
    console.log('Ingenting å gjøre.')
    return
  }

  if (dryRun) {
    console.log('\n--dry-run: eksempler på hva som ville blitt skrevet:')
    for (const d of toPatch.slice(0, 5)) {
      console.log(`  - ${d.title} (${d._id}):`)
      console.log('   ', JSON.stringify(textToBlocks(d.rewrittenText, 'rw')))
    }
    return
  }

  const CHUNK = 40
  for (let i = 0; i < toPatch.length; i += CHUNK) {
    const chunk = toPatch.slice(i, i + CHUNK)
    let tx = client.transaction()
    for (const d of chunk) {
      tx = tx.patch(d._id, p => p.set({ rewrittenText: textToBlocks(d.rewrittenText, `rw-${d._id.slice(-6)}`) }))
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
