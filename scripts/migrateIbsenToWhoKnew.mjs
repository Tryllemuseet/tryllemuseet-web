/**
 * migrateIbsenToWhoKnew.mjs
 *
 * Oppretter Henrik Ibsen som første oppføring i den nye whoKnew-samlingen
 * ("Hvem skulle trodd?"), fremhevet på forsiden, og kobler den til det
 * eksisterende legend-dokumentet for Ibsen (legend-henrik-ibsen).
 *
 * Bakgrunn: forsidens gamle ibsenSeksjon-felt sto tomt i produksjonsdatasettet
 * (bekreftet via GROQ) — teksten som faktisk vises på nettsiden i dag kommer
 * fra en hardkodet fallback i web/src/pages/index.astro. Denne teksten er
 * kilden for whoKnew-dokumentet under, slik at innholdet som allerede vises
 * offentlig ikke endrer seg ved migreringen.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/migrateIbsenToWhoKnew.mjs
 *   SANITY_TOKEN=<token> SANITY_DATASET=production node scripts/migrateIbsenToWhoKnew.mjs
 *
 * Hent token fra sanity.io/manage → prosjekt → API → Tokens (editor-tilgang).
 *
 * Etter kjøring: fjern ibsenSeksjon-feltet er allerede fjernet fra
 * homepage.ts-skjemaet i denne PR-en — ingen videre skjemaopprydding nødvendig.
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'

if (!process.env.SANITY_TOKEN) {
  console.error('❌ Mangler SANITY_TOKEN. Kjør: SANITY_TOKEN=<token> node scripts/migrateIbsenToWhoKnew.mjs')
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
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// ── Hjelpefunksjoner for PortableText ────────────────────────────

let keyIdx = 0
function k() { return `k${++keyIdx}` }

function p(text) {
  const ki = k()
  return {
    _type: 'block', _key: ki, style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: ki + 's', text, marks: [] }],
  }
}

function quote(text) {
  const ki = k()
  return {
    _type: 'block', _key: ki, style: 'blockquote', markDefs: [],
    children: [{ _type: 'span', _key: ki + 's', text, marks: [] }],
  }
}

// ── Dokumentinnhold ───────────────────────────────────────────────
// Kilde: eksisterende fallback-tekst i web/src/pages/index.astro (ibsenSeksjon)

const doc = {
  _id:   'whoKnew-henrik-ibsen',
  _type: 'whoKnew',

  isVisible:          true,
  featureOnFrontpage: true,
  frontpageOrder:     1,

  name:     'Henrik Ibsen',
  slug:     { _type: 'slug', current: 'henrik-ibsen' },
  category: 'kultur',

  hook: 'Det som få vet, er at lille Henrik som barn hadde trylling som hobby. Han ga forestillinger der han kunne få et ur til å forsvinne fra lommen på én mann og dukke opp hos en annen.',

  body: [
    p('Det som få vet, er at lille Henrik som barn hadde trylling som hobby. Han ga forestillinger der han kunne få et ur til å forsvinne fra lommen på én mann og dukke opp hos en annen.'),
    quote('Enkelte søndagsaftener fik han lov til at optræde som tryllekunstner i et af husets værelser, og alle omkringboende naboer blev indbudte til at overvære forestillingen.'),
    p('— Hedvig Stousland, Ibsens søster, i brev til Henrik Jæger'),
  ],

  relatedRef: { _type: 'reference', _ref: 'legend-henrik-ibsen' },
}

// ── Lagre ────────────────────────────────────────────────────────

try {
  await client.createOrReplace(doc)
  console.log(`✅ whoKnew-dokument for Henrik Ibsen opprettet i dataset: ${dataset}`)
  console.log('   Neste steg:')
  console.log('   1. Åpne Sanity Studio og sjekk dokumentet under «Hvem skulle trodd?»')
  console.log('   2. Legg gjerne til et bilde (image-feltet er tomt fra scriptet)')
  console.log('   3. Publiser dokumentet i Studio')
} catch (err) {
  console.error('❌ Feil:', err.message)
  process.exit(1)
}
