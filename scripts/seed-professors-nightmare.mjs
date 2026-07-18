/**
 * seed-professors-nightmare.mjs
 *
 * Seeds the "Professor's Nightmare" trick document — a classic rope trick
 * (three unequal ropes magically become equal length, then instantly
 * unequal again). Written in the museum's own words, in the same style as
 * the other five tricks (see scripts/seed-tricks.mjs).
 *
 * Video link is deliberately left out — every candidate video must be
 * embed-checked manually before being pasted into the document in Studio.
 * Same goes for mainImage/gallery: this trick's secret hand-switch move is
 * genuinely hard to describe in text alone, so photos or a video make a
 * real difference here — add them in Studio once available.
 *
 * Uses createIfNotExists with a fixed _id, so re-runs never overwrite a
 * document that has since been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-professors-nightmare.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-professors-nightmare.mjs')
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

// Portable Text helper — deterministic keys make re-runs diff-stable.
function block(idPrefix, index, text, listItem) {
  return {
    _type: 'block',
    _key: `${idPrefix}-b${index}`,
    style: 'normal',
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs: [],
    children: [{ _type: 'span', _key: `${idPrefix}-s${index}`, text, marks: [] }],
  }
}

const ID = 'trick-professors-nightmare'

const steps = [
  'Skjær til tre tau eller tykke hyssingbiter i tre tydelig ulike lengder: ett kort (ca. 25 cm), ett mellomstort (ca. 70 cm) og ett langt (ca. 115 cm). Vis dem fram etter hverandre, gjerne strukket ut ved siden av hverandre, så alle ser at de virkelig er ulike.',
  'Hold alle tre tauene samlet i den ene hånden din, med alle endene jevnt nederst — som om du holder en liten bukett. Sett fra publikum stikker det opp tre tydelig ulike lengder over hånden din.',
  'Nå kommer selve hemmeligheten: med den andre hånden bretter du enden på det lange tauet innover og rundt enden på det korte tauet, slik at de to endene bytter plass inni den knyttede hånden din — helt skjult for publikum. Denne ene bevegelsen er alt som skal til.',
  'La tauene gli sakte oppover gjennom hånden din og vis dem fram igjen. Fordi endene byttet plass, stikker nå nøyaktig like mye tau opp fra hver hånd — alle tre ser plutselig like lange ut!',
  'Gjenta byttebevegelsen én gang til, motsatt vei, og la tauene gli fram igjen. Nå er de plutselig ulike igjen, akkurat som i starten!',
]

const tips =
  'Dette er et ekte klassisk tryllenummer, og byttegrepet er vanskelig å beskrive med bare ord — det handler om å kjenne bevegelsen i fingrene. Øv sakte foran et speil, gjerne med et bilde eller en video ved siden av deg, og ikke gi opp selv om det tar mange forsøk før det sitter.'

const doc = {
  _id: ID,
  _type: 'trick',
  isVisible: true,
  title: "Professor's Nightmare",
  slug: { _type: 'slug', current: 'professors-nightmare' },
  difficulty: 'middels',
  order: 6,
  shortDescription:
    'Tre tau i tydelig ulik lengde — kort, middels og langt — blir plutselig like lange rett foran øynene på publikum. Og før noen rekker å tenke seg om, er de ulike igjen!',
  materials: [
    'Et kort tau/hyssing, ca. 25 cm',
    'Et mellomstort tau/hyssing, ca. 70 cm',
    'Et langt tau/hyssing, ca. 115 cm',
    '(Alle tre bør ha samme farge og tykkelse, så de er lette å sammenligne)',
  ],
  instructions: steps.map((text, i) => block(ID, i + 1, text, 'number'))
    .concat([block(ID, steps.length + 1, `Tips: ${tips}`)]),
}

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

  if (dryRun) {
    console.log(`  ville opprettet: ${doc._id} («${doc.title}», ${doc.difficulty}, ${steps.length} steg)`)
    return
  }

  await client.createIfNotExists(doc)
  console.log(`✔ ${doc.title} (${doc._id})`)

  const count = await client.fetch(`count(*[_type == 'trick'])`)
  console.log('')
  console.log(`Verifisering: ${count} trick-dokumenter i datasettet.`)
  console.log('Husk: video-lenke og bilder/illustrasjoner legges inn manuelt i Studio.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
