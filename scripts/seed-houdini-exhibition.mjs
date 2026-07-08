/**
 * seed-houdini-exhibition.mjs
 *
 * Seeds the first exhibitionShow document ("Harry Houdini: Verdens største
 * utbryterkonge") plus its 11 exhibitionStation documents. Documents are
 * published directly (not as drafts). Images are intentionally left out —
 * they are selected and uploaded manually in Sanity Studio afterwards.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development for a dry run.
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/seed-houdini-exhibition.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/seed-houdini-exhibition.mjs
 *
 * Safe to run multiple times — uses createOrReplace with fixed _ids
 * (houdini-exhibition, houdini-station-01 … houdini-station-11).
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-houdini-exhibition.mjs')
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

const EXHIBITION_ID = 'houdini-exhibition'

async function run() {
  console.log(`Dataset: ${dataset}`)

  // 1. Find the existing Houdini entry in "Hvem er hvem" (biography)
  const matches = await client.fetch(
    `*[_type == "biography" && (name match "Houdini" || artistName match "Houdini")]{_id, name}`
  )
  let magicianRef = null
  if (matches.length === 1) {
    magicianRef = matches[0]._id
    console.log(`✔ Fant Houdini i Hvem er hvem: "${matches[0].name}" (${matches[0]._id})`)
  } else if (matches.length > 1) {
    console.warn('⚠️  Flere biography-treff på "Houdini" — relatedMagician settes ikke automatisk:')
    for (const m of matches) console.warn(`   - ${m.name} (${m._id})`)
  } else {
    console.warn('⚠️  Fant ingen Houdini i Hvem er hvem (biography) — relatedMagician blir stående tom.')
  }

  // 2. The stations (images are added manually in Studio afterwards)
  const stations = [
    {
      title: 'Fra Budapest til Amerika',
      order: 1,
      year: '1874–1887',
      textKids:
        'Harry het egentlig Erik. Han ble født i Budapest, men familien var fattig og reiste til Amerika da han var liten. Som 12-åring måtte han dra hjemmefra for å tjene penger.',
      textAdults:
        'Erik Weisz ble født 24. mars 1874 i Budapest som sønn av en rabbiner. Familien emigrerte til Appleton, Wisconsin i 1878 og senere til New York, hvor de levde under svært knappe kår.',
    },
    {
      title: 'Superkreftene som egentlig var trening',
      order: 2,
      textKids:
        'Var Harry født med superkrefter? Nei! Han trente i timevis – holdt pusten under vann i badekaret, boksa og løp, og øvde på å dirke opp alle slags låser.',
      textAdults:
        'Houdinis ferdigheter var resultat av systematisk trening: pusteøvelser, styrketrening og inngående studier av låsemekanikk – kombinert med evnen til bevisst å gå ut av ledd i skuldre og fingre.',
    },
    {
      title: 'Fra Erik til Harry Houdini',
      order: 3,
      year: '1891',
      textKids:
        'I 1891 fant Erik på et nytt, magisk navn til seg selv: Harry Houdini! Han hyllet en fransk tryllekunstner han beundret ved å legge til en bokstav i navnet hans.',
      textAdults:
        'Navnet var en hyllest til den franske magikeren Jean-Eugène Robert-Houdin. Ironisk nok skrev Houdini senere boken "The Unmasking of Robert-Houdin" (1908), der han kritiserte sitt eget forbilde.',
      activityPrompt: 'Se den ekte "The Unmasking of Robert-Houdin" i biblioteket vårt',
    },
    {
      title: 'Metamorphosis – byttetricket',
      order: 4,
      textKids:
        'Harry og broren Theo hadde et lynraskt byttetriks: Den ene ble låst inne i en kiste, forhenget gikk opp i ett sekund – og plutselig sto den andre på toppen!',
      textAdults:
        'Metamorphosis var Houdinis signaturnummer fra starten, og han fremførte det gjennom hele karrieren – etter hvert med kone Bess som partner. Trikset bygget på timing og fleksibilitet, ikke overnaturlige krefter.',
    },
    {
      title: 'The Handcuff King',
      order: 5,
      year: '1899',
      textKids:
        'Harry utfordret politiet over hele verden: "Lås meg inne med deres beste håndjern!" Han rømte hver eneste gang, og avisene elsket det.',
      textAdults:
        'Fra 1899, med manager Martin Beck, bygget Houdini ryktet som «The Handcuff King» gjennom offentlige rømninger fra politiceller. Han lovet 100 dollar til den som kunne lage håndjern han ikke klarte å dirke opp – og tapte aldri.',
    },
    {
      title: 'Melkespann-rømningen',
      order: 6,
      year: '1908',
      textKids:
        'Harry lot seg låse inne i et melkespann fylt med vann! Publikum holdt pusten i flere minutter – helt til han plutselig dukket opp bak sceneteppet.',
      textAdults:
        'Melkespannet var konstruert slik at det kunne presses opp innenfra til tross for at lokket var låst utenfra – et eksempel på Houdinis mekaniske oppfinnsomhet.',
    },
    {
      title: 'Den kinesiske vanntortur-cellen',
      order: 7,
      year: '1912',
      textKids:
        'I det farligste trikset hans ble Harry hengt opp ned med føttene låst, og senket ned i en glasstank full av vann. Han hadde bare et par minutter på å komme seg løs!',
      textAdults:
        '"Chinese Water Torture Cell" regnes som Houdinis mest krevende og risikofylte nummer, og krevde ekstrem pustekontroll. En assistent med øks sto alltid klar i tilfelle noe gikk galt.',
    },
    {
      title: 'Den forsvinnende elefanten',
      order: 8,
      year: '1918',
      textKids:
        'På en scene i New York fikk Harry en elefant på over 4000 kilo til å forsvinne – helt foran øynene på publikum!',
      textAdults:
        'Nummeret ble fremført på Hippodrome-teateret og er et av magihistoriens mest kjente illusjonsnummer, avhengig av storskala sceneteknikk snarere enn rømningskunst.',
    },
    {
      title: 'Spøkelsesjegeren',
      order: 9,
      year: '1920-årene',
      textKids:
        'Da Harry ble voksen, møtte han folk som hevdet de kunne snakke med spøkelser. Men Harry visste hvordan triksene fungerte – og avslørte svindlerne!',
      textAdults:
        'Etter morens død i 1913 ble Houdini stadig mer engasjert i kampen mot spiritister og mediumer, og avslørte blant annet det kjente mediumet «Margery» (Mina Crandon) – noe som endte vennskapet med Sir Arthur Conan Doyle.',
    },
    {
      title: 'Den siste rømningen',
      order: 10,
      year: '31. oktober 1926',
      textKids:
        'Harrys aller siste show var på Halloween i 1926. Han var alvorlig syk, men ville ikke skuffe publikum.',
      textAdults:
        'Etter et slag mot magen fra en student i Montreal fikk Houdini en brist i blindtarmen. Til tross for sterke smerter insisterte han på å gjennomføre showet i Detroit. Han døde 31. oktober 1926, 52 år gammel.',
    },
    {
      title: 'Harrys skygge',
      order: 11,
      textKids:
        'Still deg opp ved siden av Harrys skygge og ta bilde sammen med verdens største utbryterkonge!',
      textAdults:
        'Et lekent fotomotiv inspirert av "The House of Houdini" i Budapest – en silhuett i lenker som besøkende kan stille seg ved siden av for et minne fra utstillingen.',
      activityPrompt: 'Ta bilde og del med #tryllemuseet',
    },
  ]

  // 3. Create the stations (fixed ids → published directly, re-runnable)
  const stationIds = []
  for (const s of stations) {
    const _id = `houdini-station-${String(s.order).padStart(2, '0')}`
    await client.createOrReplace({
      _id,
      _type: 'exhibitionStation',
      isVisible: true,
      slug: { _type: 'slug', current: slugify(s.title) },
      exhibition: { _type: 'reference', _ref: EXHIBITION_ID },
      ...s,
    })
    stationIds.push(_id)
    console.log(`✔ Stasjon ${s.order}: ${s.title}`)
  }

  // 4. Create the exhibition with stations in order
  await client.createOrReplace({
    _id: EXHIBITION_ID,
    _type: 'exhibitionShow',
    isVisible: true,
    title: 'Harry Houdini: Verdens største utbryterkonge',
    slug: { _type: 'slug', current: 'houdini' },
    subtitle: 'Historien om gutten som viste verden at ingenting er umulig',
    introKids:
      'Bli med og møt Harry Houdini – gutten som lærte seg å rømme fra hva som helst!',
    introAdults:
      'En utstilling om Erik Weisz, som under navnet Harry Houdini ble verdens mest berømte utbryterkunstner – og som senere brukte sin kunnskap om illusjoner til å avsløre falske spiritister.',
    ...(magicianRef ? { relatedMagician: { _type: 'reference', _ref: magicianRef } } : {}),
    stations: stationIds.map((id) => ({ _type: 'reference', _ref: id, _key: id })),
    sources: [
      { _type: 'sourceItem', _key: 'src-magician-among-spirits', label: 'A Magician Among the Spirits (1924), Internet Archive', url: 'https://archive.org/details/1924HoudiniAMagicianAmongTheSpirits' },
      { _type: 'sourceItem', _key: 'src-miracle-mongers', label: 'Miracle Mongers (1920), Internet Archive', url: 'https://archive.org/details/1920HoudiniMiracleMongers' },
      { _type: 'sourceItem', _key: 'src-unmasking', label: 'The Unmasking of Robert-Houdin (1908), Internet Archive', url: 'https://archive.org/details/unmaskingrobert00houdgoog' },
      { _type: 'sourceItem', _key: 'src-loc', label: 'Library of Congress – Houdini-samlingen', url: 'https://www.loc.gov/collections/' },
    ],
  })
  console.log(`✔ Utstilling: houdini-exhibition (${stationIds.length} stasjoner)`)

  console.log('')
  console.log('Ferdig. Husk å legge til bilder i Studio – de er bevisst utelatt her.')
  if (!magicianRef) {
    console.log('NB: relatedMagician ble ikke satt — finn riktig biography-_id manuelt i Studio.')
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
