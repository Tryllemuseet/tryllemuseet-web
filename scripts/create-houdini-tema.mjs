/**
 * create-houdini-tema.mjs
 *
 * Proof-of-concept for the new `tema` document type (schemaTypes/tema.ts):
 * creates ONE Tema document that links the three existing, previously
 * disconnected Houdini pieces together —
 *
 *   - the station-based exhibition (legend, slug "houdini")
 *   - the interactive comic story for kids (comicStory, slug "harry-houdini")
 *   - the quiz theme (quizTheme, slug "houdini")
 *
 * — so they become discoverable from one hub page at /utstillingen/harry-houdini
 * instead of three unrelated, undiscoverable URLs (see the "utstillingen
 * restructuring" discussion for the full rationale).
 *
 * Deliberately additive and non-destructive: it does NOT touch, rename, or
 * republish any of the three existing documents — it only creates one new
 * `tema` document that references them by _id. All three source documents
 * are looked up dynamically by slug (not by a hardcoded _id), since the
 * legend document's _id changed once already during the 2026-07
 * exhibitionShow -> legend migration.
 *
 * The Tema's own slug is deliberately "harry-houdini", NOT "houdini" —
 * the legend document already owns /utstillingen/houdini, and giving the
 * Tema the same slug would make its own "Fordypning"-card link back to
 * itself. Renaming the legend's slug to free up "houdini" for the Tema is
 * a separate, deliberate decision for a human to make later (it doesn't
 * risk QR codes, which resolve by reference — but it does change a live
 * URL people may already have bookmarked or printed).
 *
 * Safe to run multiple times — uses createOrReplace with a fixed _id
 * (tema-houdini).
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/create-houdini-tema.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/create-houdini-tema.mjs
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

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/create-houdini-tema.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (kun ett nytt dokument, ingenting eksisterende endres). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const TEMA_ID = 'tema-houdini'

async function run() {
  console.log(`Dataset: ${dataset}`)

  const [legendDoc, comicDoc, quizDoc] = await Promise.all([
    client.fetch(`*[_type == "legend" && slug.current == "houdini" && count(stations) > 0][0]{ _id, title, mainImage }`),
    client.fetch(`*[_type == "comicStory" && slug.current == "harry-houdini"][0]{ _id, title }`),
    client.fetch(`*[_type == "quizTheme" && slug.current == "houdini"][0]{ _id, title }`),
  ])

  const missing = []
  if (!legendDoc) missing.push('legend (Fordypning) med slug "houdini" og stasjoner')
  if (!comicDoc) missing.push('comicStory med slug "harry-houdini"')
  if (!quizDoc) missing.push('quizTheme med slug "houdini"')

  if (missing.length > 0) {
    console.error('❌ Fant ikke alle tre Houdini-dokumentene — avbryter uten å opprette Tema.')
    for (const m of missing) console.error(`   - Mangler: ${m}`)
    process.exit(1)
  }

  console.log(`✔ Fordypning: "${legendDoc.title}" (${legendDoc._id})`)
  console.log(`✔ Interaktiv historie: "${comicDoc.title}" (${comicDoc._id})`)
  console.log(`✔ Quiz-tema: "${quizDoc.title}" (${quizDoc._id})`)

  await client.createOrReplace({
    _id: TEMA_ID,
    _type: 'tema',
    isVisible: true,
    title: 'Houdini',
    slug: { _type: 'slug', current: 'harry-houdini' },
    icon: '⛓️',
    intro: 'Verdens største utbryterkonge — utforsk hele Houdini-opplevelsen: veggutstillingen i museet, den interaktive historien for barn, og quizen.',
    physicalPresence: 'room',
    order: 1,
    ...(legendDoc.mainImage?.asset ? { heroImage: legendDoc.mainImage } : {}),
    content: [
      { _type: 'legendRef', _key: 'houdini-legend', _ref: legendDoc._id },
      { _type: 'comicStoryRef', _key: 'houdini-comic', _ref: comicDoc._id },
      { _type: 'quizThemeRef', _key: 'houdini-quiz', _ref: quizDoc._id },
    ],
  })

  console.log('')
  console.log(`✔ Tema opprettet: ${TEMA_ID} — /utstillingen/harry-houdini`)
  console.log('   Husk: den underliggende utstillingen ligger fortsatt på /utstillingen/houdini (uendret).')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
