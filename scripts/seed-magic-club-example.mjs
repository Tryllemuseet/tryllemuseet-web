/**
 * seed-magic-club-example.mjs
 *
 * Proof-of-concept seed for the new «Magic Club» article series
 * (/tryllehistorie/fordypninger/magic-club) — Oslos faste magikerkveld,
 * skapt og hostet av Davido siden 2015.
 *
 * Creates:
 *   1. One `legend` document — the concept/overview article, listed among
 *      the other fordypninger.
 *   2. One `magicClubEdition` document — the 17. oktober 2019 evening at
 *      Cosmopolite Scene, seeded from a Facebook poster. Norwegian lineup
 *      names are linked to existing `biography` documents where a match
 *      was found (Davido, Finn Jon, Rune Carlsen, Vegard Johansen, Mikael
 *      Hedné); everyone else stays free text until we confirm they should
 *      get their own HEH entry.
 *
 * This is a single example edition — the full run of editions (2015 to
 * 9. april 2025) will be seeded separately once the Facebook archive has
 * been collected.
 *
 * Uses createIfNotExists with fixed _ids, so re-runs never overwrite
 * content that has since been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default. Override with
 * SANITY_DATASET=development, or pass --dry-run to only print what would
 * be written (no image upload, no writes).
 *
 * Usage:
 *   node scripts/seed-magic-club-example.mjs [--dry-run]
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or
 *    the local Sanity CLI login)
 */

import { createClient } from '@sanity/client'
import { readFileSync, createReadStream } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dryRun = process.argv.includes('--dry-run')
const dataset = process.env.SANITY_DATASET ?? 'production'

const POSTER_PATH = '/root/.claude/uploads/ffa95706-643f-5266-b9a7-7741484b4bf1/203ef85a-13792.jpg'

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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-magic-club-example.mjs')
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

function paragraphs(id, texts) {
  return texts.map((text, i) => ({
    _type: 'block',
    _key: `${id}-p${i + 1}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${id}-p${i + 1}-s1`, text, marks: [] }],
  }))
}

const LEGEND_ID = 'legend-magic-club'
const EDITION_ID = 'magic-club-2019-10-17'

const legendDoc = {
  _id: LEGEND_ID,
  _type: 'legend',
  isVisible: true,
  title: 'Magic Club',
  slug: { _type: 'slug', current: 'magic-club' },
  tagline: 'Oslos faste magikerkveld — skapt og hostet av Davido',
  years: '2015–',
  excerpt: 'Siden 2015 har Magic Club samlet landets fremste tryllekunstnere til én fast kveld i Oslo: walk-around blant gjestene, etterfulgt av et sceneshow med norske og internasjonale artister.',
  detailIntro: 'Magic Club er skapt og hostet av tryllekunstneren Davido, og har siden 2015 vært en tilbakevendende magikerkveld i Oslo. Konseptet er alltid det samme: en kveld, ett sted.',
  content: paragraphs('magic-club-content', [
    'Kvelden åpner med en introduksjon på scenen, før publikum får en times walk-around magi (kl. 20–21) med flere — ofte mange — tryllekunstnere som går fra bord til bord.',
    'Deretter følger et sceneshow med numre fra artistene. Programmet har alltid kjente norske navn på plakaten, og har ved flere anledninger også hatt verdenskjente internasjonale gjester.',
    'Denne artikkelen er et startpunkt: foreløpig dokumentert med én kveld (17. oktober 2019, Cosmopolite Scene) som eksempel. Flere kvelder — fra starten i 2015 til den foreløpig siste 9. april 2025 — legges inn etter hvert som plakater og informasjon fra Magic Clubs Facebook-side er samlet inn.',
  ]),
  tags: ['magic-club', 'oslo'],
}

const editionDoc = {
  _id: EDITION_ID,
  _type: 'magicClubEdition',
  isVisible: true,
  date: '2019-10-17',
  venue: 'Cosmopolite Scene, Oslo',
  slug: { _type: 'slug', current: '2019-10-17' },
  seriesRef: { _type: 'reference', _ref: LEGEND_ID },
  guestStars: [
    { _key: 'gs1', name: 'Finn Jon', description: '"Livin\' Legend" — spesialgjest' },
    { _key: 'gs2', name: 'Christiaan Van de Burgt', description: 'Top Class Juggler (NL)' },
  ],
  lineup: [
    { _key: 'l1', name: 'Davido', bioRef: { _type: 'reference', _ref: 'biography-fevaag-bjoern-david' } },
    { _key: 'l2', name: 'Sune Narud' },
    { _key: 'l3', name: 'Mads A. Andersen' },
    { _key: 'l4', name: 'Mike Hill' },
    { _key: 'l5', name: 'Rune Carlsen', bioRef: { _type: 'reference', _ref: 'biography-carlsen-rune' } },
    { _key: 'l6', name: 'Håkon Tranøy' },
    { _key: 'l7', name: 'Tryllemette' },
    { _key: 'l8', name: 'Kris Kon' },
    { _key: 'l9', name: 'Werner' },
    { _key: 'l10', name: 'Mikael Hedné', bioRef: { _type: 'reference', _ref: 'biography-mikael-hedne' } },
    { _key: 'l11', name: 'Jon Øystein Flink' },
    { _key: 'l12', name: 'Vegard "Vegardo" Johansen', bioRef: { _type: 'reference', _ref: 'biography-vegard-johansen' } },
  ],
  otherActs: [
    { _key: 'oa1', category: 'Dansere', names: 'Kristin Sif Holm, Johanne Nomerstad, Heidi R. Opland' },
    { _key: 'oa2', category: 'Musikalsk overraskelse', names: 'Marius Holth' },
  ],
  notes: 'Davido skapte og hostet konseptet: scene-intro, walk-around magi kl. 20–21, deretter sceneshow. Dørene åpnet kl. 19, magien startet kl. 20. Aldersgrense 18 år, med ledsagerordning for yngre. Billetter ble solgt via Ticketmaster.',
  // sourceUrl er bevisst utelatt — den faktiske lenken til Facebook-posten er
  // ikke bekreftet. Fyll inn i Studio når den faktiske post-URL-en er kjent.
}

console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

if (dryRun) {
  console.log(`  ville lastet opp plakat fra ${POSTER_PATH}`)
  console.log(`  ville opprettet legend «${legendDoc.title}» (${LEGEND_ID})`)
  console.log(`  ville opprettet magicClubEdition for ${editionDoc.date} (${EDITION_ID})`)
  process.exit(0)
}

const existingLegend = await client.fetch('*[_id == $id][0]._id', { id: LEGEND_ID })
await client.createIfNotExists(legendDoc)
console.log(existingLegend ? `  legend «${legendDoc.title}» finnes allerede — hoppet over.` : `✔ Opprettet legend «${legendDoc.title}».`)

const existingEdition = await client.fetch('*[_id == $id][0]._id', { id: EDITION_ID })
if (existingEdition) {
  console.log(`  magicClubEdition for ${editionDoc.date} finnes allerede — hoppet over.`)
} else {
  console.log(`  Laster opp plakat fra ${POSTER_PATH} ...`)
  const asset = await client.assets.upload('image', createReadStream(POSTER_PATH), {
    filename: 'magic-club-2019-10-17-plakat.jpg',
  })
  editionDoc.poster = {
    _type: 'image',
    alt: 'Plakat for Magic Club, 17. oktober 2019, Cosmopolite Scene',
    asset: { _type: 'reference', _ref: asset._id },
  }
  await client.createIfNotExists(editionDoc)
  console.log(`✔ Opprettet magicClubEdition for ${editionDoc.date}.`)
}

console.log('Ferdig.')
