/**
 * createSignageContent.mjs
 *
 * Creates the signageConfig singleton and three default signageQuote documents
 * in Sanity so the digital signage screen (skjerm.html) shows real data
 * instead of hardcoded fallbacks.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/createSignageContent.mjs
 *   SANITY_TOKEN=<token> SANITY_DATASET=development node scripts/createSignageContent.mjs
 *
 * Hent token fra sanity.io/manage → prosjekt → API → Tokens (editor-tilgang).
 *
 * Scriptet er trygt å kjøre flere ganger — det bruker createOrReplace og
 * will not overwrite manually edited documents if you change the IDs.
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

const token = process.env.SANITY_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_TOKEN=<token> node scripts/createSignageContent.mjs')
  process.exit(1)
}

if (dataset === 'production') {
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

// ── signageConfig (singleton) ─────────────────────────────────────────────────
// These are the default values — edit them in Sanity Studio after import.

const config = {
  _id: 'signageConfig',
  _type: 'signageConfig',
  qrUrl: 'https://tryllemuseet.no',
  openingHours: 'Søndager kl. 13:00 – 16:00',
  showTime: 'Kl. 14:00 — presis',
  priceAdult: 50,
  priceChild: 20,
  quoteCycleSecs: 9,
  memberQrUrl: 'https://tryllemuseet.no/blimedlem',
  overlayPanelSecs: 18,
}

// ── signageQuote documents ────────────────────────────────────────────────────

const quotes = [
  {
    _id: 'signageQuote-1',
    _type: 'signageQuote',
    text: 'Der det umulige er mulig og ting gjemmer seg inne i magiske hatter.',
    author: 'Norges Tryllemuseum',
    active: true,
    sortOrder: 1,
  },
  {
    _id: 'signageQuote-2',
    _type: 'signageQuote',
    text: 'Henrik Ibsen var faktisk tryllekunstner — visste du det?',
    author: 'Fra samlingen vår',
    active: true,
    sortOrder: 2,
  },
  {
    _id: 'signageQuote-3',
    _type: 'signageQuote',
    text: 'Over 171 norske tryllemestere dokumentert — og historien fortsetter.',
    author: 'Magiens Hvem er Hvem',
    active: true,
    sortOrder: 3,
  },
]

// ── Create documents ──────────────────────────────────────────────────────────

try {
  await client.createOrReplace(config)
  console.log('✅ signageConfig opprettet')

  for (const q of quotes) {
    await client.createOrReplace(q)
    console.log(`✅ signageQuote "${q.text.slice(0, 50)}…" opprettet`)
  }

  console.log('')
  console.log('Neste steg:')
  console.log('  1. Åpne https://tryllemuseet.sanity.studio')
  console.log('  2. Gå til «Infoskjerm – konfigurasjon» og publiser dokumentet')
  console.log('  3. Gå til «Infoskjerm – sitat» og publiser hvert sitat')
  console.log('  4. Legg til kommende arrangementer under «Arrangement»')
  console.log('  5. Skjermen oppdaterer seg automatisk innen 5 minutter')
} catch (err) {
  console.error('❌ Feil:', err.message)
  process.exit(1)
}
