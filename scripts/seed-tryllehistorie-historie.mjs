/**
 * seed-tryllehistorie-historie.mjs
 *
 * "Siste opprydding før lansering" punkt 2: den hardkodede historiske
 * fortellingen ("Magiens historie — kort fortalt") på /tryllehistorie er
 * flyttet fra web/src/pages/tryllehistorie/index.astro til to nye felt på
 * tryllehistoriePage.ts: historieIntro (ingress) og historieSeksjoner
 * (array av { heading, body } — samme contentSection-modell som legend.ts
 * bruker for "Utdypende tekst — seksjoner").
 *
 * getTryllehistoriePage() i web/src/lib/sanity.ts har en hardkodet fallback
 * med nøyaktig samme tekst, så nettsiden ser identisk ut selv uten dette
 * scriptet. Men uten det forblir feltene tomme i Studio, og en redaktør som
 * åpner dokumentet ser ingenting å redigere. Dette scriptet setter feltene
 * på det ene publiserte tryllehistoriePage-dokumentet til nøyaktig samme
 * tekst som sto hardkodet i koden, slik at innholdet blir synlig og
 * redigerbart i Studio uten at noe endrer seg visuelt på nettsiden.
 *
 * Idempotent (kan kjøres flere ganger, samme resultat) og ikke-destruktivt:
 * rører kun de to nye feltene, alt annet på dokumentet (hero, seksjoner,
 * tidslinje) er urørt. Overskriver IKKE feltene hvis de allerede har
 * innhold — bruk --force for å overskrive en eksisterende redigering.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/seed-tryllehistorie-historie.mjs [--dry-run] [--force]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-tryllehistorie-historie.mjs')
  process.exit(1)
}

const paragraph = (text, key) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
})

const historieIntro = 'Tryllekunst er kanskje verdens eldste form for underholdning: kunsten å få andre mennesker til å undres. Fortellingen strekker seg fra faraoenes hoff til dagens talentshow — og hele veien er det den samme gnisten som driver den.'

const historieSeksjoner = [
  {
    _key: 'hs1',
    heading: 'De første undrene',
    body: [paragraph('Lenge før det fantes teatre og TV, samlet folk seg rundt gjøglere som fikk små kuler til å forsvinne under begre. Begerspillet — verdens eldste kjente trylletriks — ble avbildet i Egypt for rundt fire tusen år siden, og en gammel nedtegnelse forteller om magikeren Dedi, som skal ha opptrådt for selveste farao Khufu. Trangen til å bli forundret er med andre ord like gammel som sivilisasjonen selv.', 'hs1p1')],
  },
  {
    _key: 'hs2',
    heading: 'Gjøglere i farlige tider',
    body: [paragraph('I middelalderens Europa levde tryllekunsten på markedsplassene, blant gjøglere og omreisende artister. Men kunsten kunne være livsfarlig: Den som var for flink med hendene, risikerte å bli anklaget for trolldom. Da engelskmannen Reginald Scot i 1584 ga ut «The Discoverie of Witchcraft», var det nettopp for å vise at taskenspillernes triks var fingerferdighet — ikke djevelskap. Boken ble samtidig den første trykte forklaringen på hvordan triksene gjøres.', 'hs2p1')],
  },
  {
    _key: 'hs3',
    heading: 'Fra markedsbod til teatersal',
    body: [paragraph('Utover 1700- og 1800-tallet flyttet magien innendørs. Den franske urmakeren Jean-Eugène Robert-Houdin åpnet sitt eget teater i Paris i 1845 og kledde tryllekunsten i kjole og hvitt: eleganse, mekaniske underverker og vitenskapens språk i stedet for gjøglerens kappe. Den moderne scenetryllingen var født — og en ung amerikaner valgte senere kunstnernavnet Houdini til ære for ham.', 'hs3p1')],
  },
  {
    _key: 'hs4',
    heading: 'Gullalderen',
    body: [paragraph('Tiårene fra midten av 1800-tallet til rundt 1930 kalles gjerne magiens gullalder. Herrmann, Kellar, Thurston og Houdini fylte de største scenene i verden, reiste på turné med tonnevis av illusjoner og kjempet om publikums gunst med praktfulle litografiske plakater. Også i Norge lot man seg fortrylle — en ung Henrik Ibsen holdt sine egne trylleforestillinger hjemme i Skien, og verdensstjernene fant veien til norske scener.', 'hs4p1')],
  },
  {
    _key: 'hs5',
    heading: 'Nedgang — og nytt liv',
    body: [paragraph('Så kom filmen, radioen og etter hvert fjernsynet, og de store illusjonsshowene mistet publikum. Men magien døde ikke — den tilpasset seg. Tryllekunstnerne samlet seg i foreninger som Magiske Cirkel Norge, stiftet i Oslo i 1928, kunsten fant nye hjem i TV-studioer og klubblokaler, og på 1990-tallet førte gatemagien trolldommen helt ut på fortauet igjen — tett på publikum, akkurat som ved markedsbodene tusen år tidligere.', 'hs5p1')],
  },
  {
    _key: 'hs6',
    heading: 'Historien fortsetter',
    body: [paragraph('I dag lever tryllekunsten i beste velgående — på teaterscener og i talentshow, i bursdagsselskaper og på skjermen. Og på Årvoll gård i Oslo tar Tryllemuseet vare på hele denne fortellingen: gjenstandene, plakatene, bøkene og menneskene som har viet livet til det umulige. Resten av historien finner du i arkivene nedenfor.', 'hs6p1')],
  },
]

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (setter tryllehistoriePage.historieIntro + historieSeksjoner). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function run() {
  const doc = await client.fetch(`*[_type == "tryllehistoriePage" && !(_id in path("drafts.**"))][0]{ _id, historieIntro, historieSeksjoner }`)
  if (!doc?._id) {
    console.error('❌ Fant ingen publisert tryllehistoriePage-dokument.')
    process.exit(1)
  }

  const alreadyHasContent = !!doc.historieIntro || (doc.historieSeksjoner?.length ?? 0) > 0
  console.log(`Fant tryllehistoriePage-dokument: ${doc._id}`)
  console.log(`Har allerede innhold i disse feltene: ${alreadyHasContent ? 'JA' : 'nei'}`)

  if (alreadyHasContent && !force) {
    console.log('\n⏭️  Feltene har allerede innhold — hopper over for å ikke overskrive en redigering.')
    console.log('   Bruk --force for å overskrive med teksten fra koden likevel.')
    return
  }

  console.log(`\nSetter historieIntro (${historieIntro.length} tegn) og ${historieSeksjoner.length} historieSeksjoner.`)

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  await client.patch(doc._id).set({ historieIntro, historieSeksjoner }).commit()

  console.log('\n✅ Oppdatert.')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
