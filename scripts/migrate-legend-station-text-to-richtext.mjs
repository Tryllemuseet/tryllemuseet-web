/**
 * migrate-legend-station-text-to-richtext.mjs
 *
 * `legend.stations[].textAdults` changed from a plain `text` field to an
 * array of Portable Text blocks (richBlockContent) in #158, but stations
 * created before that (the Houdini exhibition, seeded by
 * scripts/seed-houdini-exhibition.mjs) still hold plain strings. Studio then
 * reports «Expected type "Array", got "String"» per station, and the site's
 * `textAdults[]{…}` projection returns null, so the text isn't shown.
 *
 * This wraps each plain-string `textAdults` into one Portable Text block per
 * blank-line-separated paragraph. No text is changed — only re-wrapped.
 * Unlike the other richtext migrations it also patches drafts, since a draft
 * holding the old shape would keep the validation errors in Studio.
 *
 * Idempotent: stations whose `textAdults` is already an array are skipped.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/migrate-legend-station-text-to-richtext.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')

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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/migrate-legend-station-text-to-richtext.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (konverterer legend.stations[].textAdults til riktekst). Venter 5 sekunder...')
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
  // Includes drafts on purpose (see header).
  const docs = await client.fetch(`
    *[_type == "legend" && defined(stations)]{ _id, title, stations[]{ _key, title, textAdults } }
  `)

  const toPatch = docs
    .map(d => ({ ...d, stations: d.stations.filter(s => typeof s.textAdults === 'string') }))
    .filter(d => d.stations.length > 0)

  const missingKey = toPatch.flatMap(d => d.stations.filter(s => !s._key).map(s => `${d._id}: ${s.title}`))
  if (missingKey.length) {
    console.error('❌ Stasjoner uten _key kan ikke patches trygt:', missingKey)
    process.exit(1)
  }

  console.log(`Fant ${docs.length} legend-dokumenter med stasjoner (inkl. utkast).`)
  console.log(`${toPatch.length} har stasjoner med ren tekst i textAdults:`)
  for (const d of toPatch) console.log(`  - ${d.title} (${d._id}): ${d.stations.length} stasjoner`)

  if (toPatch.length === 0) {
    console.log('Ingenting å gjøre.')
    return
  }

  if (dryRun) {
    const d = toPatch[0]
    const s = d.stations[0]
    console.log(`\n--dry-run: eksempel (${d._id}, «${s.title}»):`)
    console.log('   ', JSON.stringify(textToBlocks(s.textAdults, `ta-${s._key}`)))
    return
  }

  const tx = client.transaction()
  for (const d of toPatch) {
    const set = Object.fromEntries(
      d.stations.map(s => [`stations[_key=="${s._key}"].textAdults`, textToBlocks(s.textAdults, `ta-${s._key}`)]),
    )
    tx.patch(d._id, p => p.set(set))
  }
  await tx.commit()

  console.log('\n✅ Ferdig.')
}

run().catch(err => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
