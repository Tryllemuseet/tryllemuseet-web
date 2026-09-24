/**
 * unset-dead-homepage-fields.mjs
 *
 * PR #151 removed a set of fields from schemaTypes/homepage.ts that
 * web/src/pages/index.astro never read (leftovers from an older homepage
 * layout, several already flagged ⚠️ "vises ikke på nettsiden" in the old
 * schema). Removing a field from the schema doesn't delete the data on
 * existing documents — Sanity Studio just started showing "Unknown fields
 * found" warnings on the published `homepage` singleton because it still
 * carries the old values.
 *
 * This script unsets exactly the fields removed in that PR, on the single
 * published `homepage` document, using Sanity's dot-path patch syntax so
 * everything else on the document (heroIdentitet, heroBannere, oppleveKort,
 * fremhevetInnhold.elementer, barnSeksjon.heading/ingress, medlemSeksjon,
 * kursSeksjon.heading/ingress/knappLabel/knappHref) is left untouched.
 *
 * Does NOT touch `drafts.homepage`.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/unset-dead-homepage-fields.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/unset-dead-homepage-fields.mjs')
  process.exit(1)
}

const fieldsToUnset = [
  'hero',
  'infoBadges',
  'omMuseet',
  'kursSitat',
  'fremhevetInnhold.eraLabel',
  'fremhevetInnhold.heading',
  'barnSeksjon.features',
  'barnSeksjon.sitater',
  'kursSeksjon.detaljer',
  'kursSeksjon.pris',
  'kursSeksjon.prisLabel',
  'kursSeksjon.fondsBadge',
]

if (dataset === 'production' && !dryRun) {
  console.log(`⚠️  Du skriver til PRODUKSJONSDATASETTET (unsetter ${fieldsToUnset.length} foreldreløse felt på homepage). Venter 5 sekunder...`)
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function run() {
  const doc = await client.fetch(`*[_type == "homepage" && !(_id in path("drafts.**"))][0]`)
  if (!doc?._id) {
    console.error('❌ Fant ingen publisert homepage-dokument.')
    process.exit(1)
  }

  console.log(`Fant homepage-dokument: ${doc._id}\n`)
  console.log('Felt som fjernes (kun de som faktisk finnes på dokumentet):')
  const present = fieldsToUnset.filter((path) => {
    const [top, sub] = path.split('.')
    const value = sub ? doc[top]?.[sub] : doc[top]
    return value !== undefined
  })
  for (const path of present) console.log(`  - ${path}`)
  if (present.length === 0) {
    console.log('  (ingen — dokumentet har ingen av disse feltene)')
    return
  }

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  await client.patch(doc._id).unset(present).commit()

  console.log('\n✅ Oppdatert.')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
