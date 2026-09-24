/**
 * add-kurs-nav-item.mjs
 *
 * Adds a "Tryllekurs" sub-nav item (→ /aktiviteter/kurs) under the "Hva
 * skjer" main nav area on the existing `siteNavigation` singleton, right
 * after "Barn & unge". Mirrors the DEFAULT_MAIN_AREAS fallback in
 * web/src/lib/sanity.ts, which was updated in the same change.
 *
 * Content-only — patches one array field, nothing else. Idempotent: if a
 * "Tryllekurs" sub-item already exists under "Hva skjer", exits without
 * making changes.
 *
 * Targets the PRODUCTION dataset by default (the only dataset that exists
 * in this project — see CLAUDE.md, July 2026 note). Pass --dry-run to only
 * print the patch without writing.
 *
 * Usage:
 *   node scripts/add-kurs-nav-item.mjs [--dry-run]
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or
 *    the local Sanity CLI login)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dryRun = process.argv.includes('--dry-run')
const dataset = process.env.SANITY_DATASET ?? 'production'

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token =
  process.env.SANITY_API_TOKEN ??
  process.env.SANITY_TOKEN ??
  process.env.SANITY_AUTH_TOKEN ??
  getStoredToken()

if (!token && !dryRun) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/add-kurs-nav-item.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET. Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const doc = await client.fetch(`*[_type == "siteNavigation"][0]{ _id, mainAreas }`)
if (!doc) {
  console.error('❌ Fant ikke siteNavigation-dokumentet.')
  process.exit(1)
}

const aktiviteter = doc.mainAreas?.find(a => a.link === '/aktiviteter')
if (!aktiviteter) {
  console.error('❌ Fant ikke "Hva skjer"-hovedområdet (link === "/aktiviteter").')
  process.exit(1)
}

if (aktiviteter.subAreas?.some(s => s.link === '/aktiviteter/kurs')) {
  console.log('ℹ️  "Tryllekurs" finnes allerede under "Hva skjer" — gjør ingenting.')
  process.exit(0)
}

const barnIndex = aktiviteter.subAreas.findIndex(s => s.link === '/barn')
const insertAt = barnIndex === -1 ? aktiviteter.subAreas.length : barnIndex + 1

const newSubAreas = [...aktiviteter.subAreas]
newSubAreas.splice(insertAt, 0, {
  _key: 'kurs',
  label: 'Tryllekurs',
  link: '/aktiviteter/kurs',
  isVisible: true,
  featureFlag: 'none',
})

const newMainAreas = doc.mainAreas.map(a => (a.link === '/aktiviteter' ? { ...a, subAreas: newSubAreas } : a))

if (dryRun) {
  console.log('🔍 DRY RUN — ville ha satt "Hva skjer".subAreas til:')
  console.log(JSON.stringify(newSubAreas, null, 2))
  process.exit(0)
}

const result = await client.patch(doc._id).set({ mainAreas: newMainAreas }).commit()
console.log(`✅ Oppdatert siteNavigation (dataset: ${dataset}), _rev: ${result._rev}`)
