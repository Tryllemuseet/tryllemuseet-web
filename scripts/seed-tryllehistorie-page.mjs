/**
 * seed-tryllehistorie-page.mjs
 *
 * Creates the tryllehistoriePage singleton so the "Tryllehistorie" menu item
 * in Sanity Studio actually has a document to edit. Until now the document
 * never existed — the /tryllehistorie landing page ran entirely on the
 * hardcoded fallback values in web/src/lib/sanity.ts (getTryllehistoriePage).
 * This script seeds that same content as the initial editable document.
 *
 * Uses createIfNotExists with the fixed _id "tryllehistoriePage" (matching
 * the singleton convention used by e.g. homepage/quizConfig), so re-runs
 * never overwrite content that has since been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-tryllehistorie-page.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-tryllehistorie-page.mjs')
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

// Content mirrors the fallback values in web/src/lib/sanity.ts
// (getTryllehistoriePage) as of 2026-07-18. Archive-card badges below get
// overridden at page-render time by live document counts for known hrefs
// (see autoBadge in getTryllehistoriePage) — the values here only matter
// for cards not covered by that auto-badge map.
const doc = {
  _id: 'tryllehistoriePage',
  _type: 'tryllehistoriePage',
  hero: {
    label: 'Tryllemuseet',
    heading: 'Tryllehistorie',
    ingress: 'Fra begerspillet i Egypt for 4000 år siden til gullalderens store scenemagikere og norske tryllekunstnere i dag — magiens lange historie.',
  },
  seksjoner: [
    { _key: 's1', href: '/tryllehistorie/magiens-hvem-er-hvem', emoji: '📖', title: 'Magiens Hvem er Hvem', sub: 'Norske tryllekunstnere', desc: 'Biografier over norske tryllekunstnere fra Terje Nordheims standardverk. Søk på navn, kunstnernavn og spesialitet.', badge: 'Biografier', soon: false },
    { _key: 's2', href: '/utstillingen', emoji: '🎩', title: 'Gullalderen 1845–1930', sub: 'Internasjonal tryllehistorie', desc: 'Robert-Houdin, Herrmann, Kellar, Thurston og Houdini — magikerne som forandret verden og skapte scenetryllingens gylne epoke.', badge: '7 utstillingsfelt', soon: false },
    { _key: 's3', href: '/tryllehistorie/hvem-skulle-trodd', emoji: '🎭', title: 'Hvem skulle trodd?', sub: 'Kjente ansikter, hemmelig magi', desc: 'Visste du at Henrik Ibsen tryllet? Fra vitenskap til sport og kultur — kjente personligheter med et hemmelig forhold til magien.', badge: 'Artikler', soon: false },
    { _key: 's4', href: '/tryllehistorie/begerspillet', emoji: '🏺', title: 'Begerspillet', sub: 'Magiens opprinnelse', desc: 'Verdens eldste kjente trylletriks — avbildet i Egypt for over 4000 år siden. Historien om magiens aller første triks.', badge: 'Kommer snart', soon: true },
    { _key: 's5', href: '/tryllehistorie/fordypninger', emoji: '⭐', title: 'Fordypninger', sub: 'Portretter og dypdykk', desc: 'Egelo, Jan Crosby, Arnardo og andre — norske og internasjonale tryllekunstnere som har satt spor. Dyptgående portretter.', badge: '8 artikler', soon: false },
    { _key: 's6', href: '/tryllehistorie/got-talent', emoji: '🏆', title: 'Got Talent', sub: 'Nordisk TV-magi', desc: 'Norske, svenske, danske og finske tryllekunstnere i Norske Talenter, Talang, Danmark har Talent og Talent Suomi.', badge: '35 opptredener', soon: false },
    { _key: 's7', href: '/tryllehistorie/fool-us', emoji: '🎯', title: 'Penn & Teller: Fool Us', sub: 'Nordisk TV-magi', desc: 'Nordiske magikere som har møtt Penn & Teller i den prestisjetunge fagduellen fra Las Vegas. 7 klarte å lure dem.', badge: 'Opptredener', soon: false },
  ],
  tidslinjeHeading: '4000 år med magi',
  tidslinje: [
    { _key: 't1', aar: 'ca. 2500 f.Kr.', hendelse: 'Magikeren Dedi skal ha opptrådt for farao Khufu — historiens eldste navngitte tryllekunstner', siste: false },
    { _key: 't2', aar: 'ca. 2000 f.Kr.', hendelse: 'Begerspillet avbildes i Egypt — verdens eldste kjente trylletriks', siste: false },
    { _key: 't3', aar: '1584', hendelse: 'Reginald Scots «The Discoverie of Witchcraft» — den første trykte boken som forklarer trylletriks', siste: false },
    { _key: 't4', aar: '1600-tallet', hendelse: 'Ordet «hokus pokus» dukker opp i England — en gjøglers liksom-latin, laget for å høres magisk ut', siste: false },
    { _key: 't5', aar: '1770', hendelse: 'Kempelens «sjakktyrker» forbløffer Europa — og spiller mot både Napoleon og Benjamin Franklin', siste: false },
    { _key: 't6', aar: 'ca. 1840', hendelse: 'Unge Henrik Ibsen holder trylleforestillinger for naboene hjemme i Skien', siste: false },
    { _key: 't7', aar: '1845', hendelse: 'Robert-Houdin åpner sitt teater i Paris — den moderne scenetryllingens fødsel', siste: false },
    { _key: 't8', aar: '1848', hendelse: 'Fox-søstrene lar «åndene» banke i bordet — den moderne spiritismen fødes i USA', siste: false },
    { _key: 't9', aar: '1856', hendelse: 'Robert-Houdin stopper et opprør i Algerie — med tryllekunst', siste: false },
    { _key: 't10', aar: '1865', hendelse: '«Sfinksen» vises i London — speilillusjonenes store gjennombrudd', siste: false },
    { _key: 't11', aar: '1896', hendelse: 'Adelaide Herrmann overtar showet etter sin manns død — blir «The Queen of Magic»', siste: false },
    { _key: 't12', aar: '1896', hendelse: 'Méliès lar en dame forsvinne på film — trylleriet flytter inn i det nye mediet', siste: false },
    { _key: 't13', aar: '1908', hendelse: 'Kellar overrekker tittelen til Thurston — gullalderens store kroningsseremoni', siste: false },
    { _key: 't14', aar: '1926', hendelse: 'Houdini dør på Halloween — gullalderens slutt', siste: false },
    { _key: 't15', aar: '1928', hendelse: 'Magiske Cirkel Norge stiftes i Oslo 21. oktober — opprinnelig som Magisk Cirkel Oslo', siste: false },
    { _key: 't16', aar: '1947', hendelse: 'Den Magiske Ring stiftes i Oslo — ti unge tryllekunstnere rundt et rundt bord', siste: false },
    { _key: 't17', aar: '1997', hendelse: 'David Blaines «Street Magic» — vendepunktet for gatemagien på TV', siste: false },
    { _key: 't18', aar: 'I dag', hendelse: 'Tryllemuseet på Årvoll holder historien levende', siste: true },
  ],
}

console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

if (dryRun) {
  console.log(`  ville opprettet: ${doc._id} («${doc.hero.heading}», ${doc.seksjoner.length} seksjoner, ${doc.tidslinje.length} tidslinjepunkter)`)
} else {
  const created = await client.createIfNotExists(doc)
  console.log(`✔ ${created._id} opprettet/uendret (publisert) i «${dataset}».`)
  console.log('  Innholdet kan nå redigeres i Studio under «Tryllehistorie».')
}
