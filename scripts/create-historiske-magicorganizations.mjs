// scripts/create-historiske-magicorganizations.mjs
//
// Phase 2 step 7.5 of the "Mystikk som underholdning" (Berthelsen & Nordheim,
// 2005) digitization project: create the 6 magicOrganization documents
// identified in the source tables. All created with isVisible: false for
// manual review — only verified fields are set, nothing invented.
//
// Run: SANITY_AUTH_TOKEN=... node scripts/create-historiske-magicorganizations.mjs

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'n2ynpgty',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

// Existing Magiske Cirkel Norge document — target of mergedInto for MJC and FAMIT.
const MCN_ID = '2c15e3c7-bf5e-40e6-9b1a-7ccaf08fd715'

const documents = [
  {
    _type: 'magicOrganization',
    isVisible: false,
    name: 'Den Magiske Ring',
    abbreviation: 'DMR',
    country: 'Norge',
    ingress: 'Tidligere kjent som «Den Magiske Ring Oslo» (DMRO).',
    internalNotes:
      'Foundedyear ikke satt: kildematerialet oppgir første kjente formann i 1947 (Ragnar Andresen), ' +
      'som antyder grunnleggelse ≤1947, men selve grunnleggelsesåret er ikke bekreftet i kilden — ikke gjettet.',
  },
  {
    _type: 'magicOrganization',
    isVisible: false,
    name: 'Magiske Junior Cirkel',
    abbreviation: 'MJC',
    country: 'Norge',
    foundedYear: 1958,
    mergedInto: { _type: 'reference', _ref: MCN_ID },
    internalNotes:
      'foundedYear 1958 er sannsynliggjort, ikke absolutt bekreftet: MCNs egen orgtekst nevner ' +
      'juniorforening fra 1958, og første president i kildetabellen starter nettopp 1958. ' +
      'dissolutionYear er bevisst ikke satt — siste faste president i kildematerialet er 1996 (fotnote), ' +
      'men dette er ikke bekreftet som avviklingsår (avklart med Trond 2026-09-22).',
  },
  {
    _type: 'magicOrganization',
    isVisible: false,
    name: 'Nordisk Magiker-Union',
    abbreviation: 'NMU',
    internalNotes: 'Fullt navn er en usikker antakelse — ikke bekreftet mot kilde.',
  },
  {
    _type: 'magicOrganization',
    isVisible: false,
    name: 'Svenska Magiska Cirkeln',
    abbreviation: 'SMC',
    country: 'Sverige',
    internalNotes: 'Fullt navn er en usikker antakelse — ikke bekreftet mot kilde.',
  },
  {
    _type: 'magicOrganization',
    isVisible: false,
    name: 'Magisk Cirkel Danmark',
    abbreviation: 'MCD',
    country: 'Danmark',
    internalNotes: 'Fullt navn er en usikker antakelse — ikke bekreftet mot kilde.',
  },
  {
    _type: 'magicOrganization',
    isVisible: false,
    name: 'FAMIT',
    abbreviation: 'FAMIT',
    country: 'Norge',
    ingress: 'Foreningen av magikere i Trøndelag.',
    mergedInto: { _type: 'reference', _ref: MCN_ID },
  },
]

const transaction = client.transaction()
for (const doc of documents) {
  transaction.create(doc)
}

const result = await transaction.commit()
console.log(JSON.stringify(result, null, 2))
