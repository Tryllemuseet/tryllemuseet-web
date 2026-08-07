/**
 * seed-houdini-sunday-events.mjs
 *
 * Creates one `event` document per remaining Sunday the museum is open
 * this autumn (2026-09-06 through 2026-12-13, matching the run of the
 * "Houdini-utstilling i museet!" event which spans 2026-08-16 to
 * 2026-12-13 — see event slug "houdini-utstilling-i-museet"). The first
 * three Sundays of the run (16/8, 23/8, 30/8) already have their own
 * "Åpent museum" event documents and are intentionally left untouched.
 *
 * Each new event advertises the Sunday opening hours (12:00–15:00) and
 * mentions the exhibition under its campaign name "Houdini: Mesteren
 * over det umulige" (chosen 2026-08 for these Sunday events specifically
 * — the underlying `legend` exhibition document keeps its existing title
 * "Harry Houdini: Verdens største utbryterkonge" and is not touched here).
 *
 * Dates are stored as UTC instants equivalent to 12:00–15:00 Europe/Oslo
 * local time: CEST (UTC+2) through 2026-10-18, CET (UTC+1) from
 * 2026-10-25 onward (DST ends the morning of 2026-10-25, before opening
 * hours), matching the existing August event documents and the endDate
 * on "houdini-utstilling-i-museet".
 *
 * Safe to run multiple times — uses createOrReplace with fixed, readable
 * _ids (e.g. "apent-museum-6-9").
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/seed-houdini-sunday-events.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/seed-houdini-sunday-events.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

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

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-houdini-sunday-events.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (15 nye arrangement-dokumenter, ingenting eksisterende endres). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const EXCERPT =
  'Museet har åpent søndag kl. 12–15. Se utstillingen «Houdini: Mesteren over det umulige» og bli med på rømningskongens forbløffende historie.'

// [isoDate, "d/m" label, opening-hour UTC, closing-hour UTC]
// CEST (UTC+2) through 18/10, CET (UTC+1) from 25/10 (DST ends 25/10 before opening hours).
const SUNDAYS = [
  ['2026-09-06', '6/9', 10, 13],
  ['2026-09-13', '13/9', 10, 13],
  ['2026-09-20', '20/9', 10, 13],
  ['2026-09-27', '27/9', 10, 13],
  ['2026-10-04', '4/10', 10, 13],
  ['2026-10-11', '11/10', 10, 13],
  ['2026-10-18', '18/10', 10, 13],
  ['2026-10-25', '25/10', 11, 14],
  ['2026-11-01', '1/11', 11, 14],
  ['2026-11-08', '8/11', 11, 14],
  ['2026-11-15', '15/11', 11, 14],
  ['2026-11-22', '22/11', 11, 14],
  ['2026-11-29', '29/11', 11, 14],
  ['2026-12-06', '6/12', 11, 14],
  ['2026-12-13', '13/12', 11, 14],
]

function slugify(label) {
  return `apent-museum-${label.replace('/', '-')}`
}

async function run() {
  console.log(`Dataset: ${dataset}`)

  const docs = SUNDAYS.map(([isoDate, label, openHourUtc, closeHourUtc]) => {
    const slug = slugify(label)
    return {
      _id: slug,
      _type: 'event',
      title: `Åpent museum ${label} – Houdini: Mesteren over det umulige`,
      slug: { _type: 'slug', current: slug },
      date: `${isoDate}T${String(openHourUtc).padStart(2, '0')}:00:00.000Z`,
      endDate: `${isoDate}T${String(closeHourUtc).padStart(2, '0')}:00:00.000Z`,
      ageGroup: 'Alle',
      price: 'Gratis inngang',
      excerpt: EXCERPT,
      featured: false,
    }
  })

  const tx = client.transaction()
  for (const doc of docs) {
    tx.createOrReplace(doc)
    console.log(`✔ ${doc.slug.current} — ${doc.date} → ${doc.endDate}`)
  }
  await tx.commit()

  console.log(`\n✅ Opprettet/oppdatert ${docs.length} arrangementer.`)
}

run().catch(err => {
  console.error('❌ Feilet:', err.message)
  process.exit(1)
})
