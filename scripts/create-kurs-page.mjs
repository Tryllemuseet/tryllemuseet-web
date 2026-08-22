/**
 * create-kurs-page.mjs
 *
 * Creates the new `kursPage` singleton document, seeded with the course
 * content that was previously buried in dead/unused fields on `homepage`
 * (kursSeksjon.detaljer/pris/prisLabel/fondsBadge and kursSitat — none of
 * which were ever rendered on the site). This gives Tryllekurs its own
 * proper page at /aktiviteter/kurs instead.
 *
 * Content-only — no schema changes, no deletions. Does NOT touch or remove
 * anything on the `homepage` document; that's a separate follow-up once
 * this page is live and confirmed.
 *
 * Idempotent: if a `kursPage` document already exists, this script exits
 * without making changes rather than creating a duplicate.
 *
 * Targets the PRODUCTION dataset by default (the only dataset that exists
 * in this project — see CLAUDE.md, July 2026 note). Pass --dry-run to only
 * print the document without writing.
 *
 * Usage:
 *   node scripts/create-kurs-page.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/create-kurs-page.mjs')
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

const doc = {
  _type: 'kursPage',
  hero: {
    label: 'Hva skjer',
    heading: 'Tryllekurs for barn',
    ingress: 'Du lærer triks som er enkle å utføre, men som virker meget imponerende. Kursene går over tre ettermiddager annenhver uke.',
  },
  omKurset: {
    heading: 'Om kurset',
    tekst: 'Du lærer triks som er enkle å utføre, men som virker meget imponerende. Kursene går over tre ettermiddager annenhver uke.',
  },
  detaljer: [
    'Aldersgrupper: 6–8 år (kl. 17) · 9–12 år (kl. 18.30) · 13+ år (kl. 20)',
    'Kun 14 plasser per kurs — «først til mølla»',
    'Inkluderer kursmateriell og tryllerekvisitter',
  ],
  pris: { belop: '50,-', label: 'pr kurs' },
  fondsBadge: 'Støttet av Sparebankstiftelsen DNB',
  sitat: {
    tekst: '«Vil bare takke for et utrolig gøyalt tryllekurs — han koste seg!»',
    kilde: 'Mor til kursdeltaker, 8 år · Februar 2026',
  },
  pamelding: {
    knappLabel: 'Se kommende kurs',
    knappHref: 'https://kurs.tryllemuseet.no',
  },
}

if (dryRun) {
  console.log('🔍 DRY RUN — ville ha opprettet kursPage-dokument:')
  console.log(JSON.stringify(doc, null, 2))
  process.exit(0)
}

const existing = await client.fetch(`*[_type == "kursPage"][0]._id`)
if (existing) {
  console.log(`ℹ️  Et kursPage-dokument finnes allerede (${existing}) — gjør ingenting.`)
  process.exit(0)
}

const result = await client.create(doc)
console.log(`✅ Opprettet kursPage (dataset: ${dataset}), _id: ${result._id}`)
