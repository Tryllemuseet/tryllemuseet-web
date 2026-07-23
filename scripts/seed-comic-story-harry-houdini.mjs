/**
 * seed-comic-story-harry-houdini.mjs
 *
 * Seeds the comicStory document "Harry Houdini: Mannen, Myten, Legenden" for
 * /barn/historier/harry-houdini — ported from the Lovable project
 * TrondRein/history-stories-houdini (src/content/comic.ts).
 *
 * Image handling:
 *   - 4 of the 23 images (the scene illustrations for scene 1, 4, 6 and 8)
 *     are committed locally under scripts/assets/comic-story-harry-houdini/
 *     and get uploaded automatically as Sanity image assets.
 *   - The remaining 19 images are historical Library of Congress photos that
 *     only existed as Lovable-CDN pointers (not fetchable from outside
 *     Lovable) — those fields are created WITHOUT an asset (alt/caption text
 *     is filled in) and must be uploaded manually in Sanity Studio
 *     afterwards. A checklist is printed at the end of this script listing
 *     exactly which scene/field needs which original filename.
 *
 * Refuses to run if a document with this _id already exists, so re-running
 * never overwrites edits made in Studio (and never re-uploads images).
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-comic-story-harry-houdini.mjs [--dry-run]
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or
 *    the local Sanity CLI login — run `npx sanity login` first)
 */

import { createClient } from '@sanity/client'
import { createReadStream, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = join(__dirname, 'assets', 'comic-story-harry-houdini')

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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-comic-story-harry-houdini.mjs')
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

const DOC_ID = 'comic-story-harry-houdini'

// ── Scene-innhold (fra Lovable-prosjektet history-stories-houdini) ─────
// image/extraImages: filnavn = null → ingen lokal fil, må lastes opp manuelt.
const SCENES = [
  {
    key: 'gutten-fra-budapest',
    year: '1887',
    chapter: '1 · Gutten fra Budapest',
    imageAlt: 'Ung Ehrich Weiss som tenåring, portrettert i mørk jakke, blikket rettet framover.',
    imageFile: 'scene-1-gutten-fra-budapest.jpg',
    caption: 'Den tøffe starten i en ny verden.',
    narration: [
      'Født i Ungarn som Erik Weisz i 1874 kom han til USA og opplevde dyp fattigdom i Wisconsin og New York.',
      'Allerede som niåring viste han atletiske evner og opptrådte som trapesartist under navnet «Ehrich the Prince of the Air».',
    ],
    dialogue: [
      { speaker: 'Ehrich', text: 'En dag skal jeg bli stor, mor, og ta vare på deg resten av livet!' },
      { speaker: 'Cecilia (mor)', text: 'Å, min lille Ehrie …' },
    ],
    hotspots: [
      { x: 50, y: 35, label: 'Trapes', fact: 'Ehrich tok ulike småjobber for å hjelpe familien økonomisk, og ble tidlig introdusert for sirkus- og underholdningslivet.' },
      { x: 42, y: 70, label: 'Fysisk trening', fact: 'Han drev aktivt med svømming, løping og boksing i ung alder — muskelstyrken ble avgjørende senere i karrieren.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-young-ehrich.jpg', alt: 'Portrett av en ung gutt i uniform med lue, holdende et brev — antatt å være en ung Ehrich Weiss. Library of Congress.', caption: 'Ung Ehrich Weiss i uniform — årene før scenelyset.' },
    ],
    factBox: { title: 'Visste du?', body: 'Houdini fabrikkerte ofte at han var født i Appleton, Wisconsin, for å fremstå som en ekte amerikaner — selv om immigrasjonspapirene viste noe helt annet.' },
  },
  {
    key: 'navnet-blir-til',
    year: '1891',
    chapter: '2 · Navnet blir til',
    imageAlt: 'Trippelportrett av Harry Houdini og hans yngre bror Theodor «Theo» Hardeen, tatt hos J. Lavier i Paris 15. desember 1901. Library of Congress.',
    imageFile: null,
    imageSourceFilename: 'loc-houdini-hardeen.jpg',
    caption: 'Harry og broren Theo — «The Brothers Houdini» (Paris, 1901).',
    narration: [
      'Etter å ha lest memoarene til den franske magikeren Jean-Eugène Robert-Houdin bestemte unge Ehrich seg for å bli profesjonell tryllekunstner.',
      'Sammen med vennen Jacob Hyman tok han navnet Houdini, og de opptrådte som «The Brothers Houdini».',
    ],
    dialogue: [
      { speaker: 'Jacob Hyman', text: 'Legg til en «i» på slutten av Houdin, Ehrich — så betyr det «som Houdin» på fransk!' },
      { speaker: 'Harry', text: 'Harry Houdini … «Harry» for kallenavnet mitt «Ehrie». Det er perfekt!' },
    ],
    hotspots: [
      { x: 50, y: 62, label: 'Boken', fact: 'Robert-Houdins bok inspirerte ham dypt — men Houdini skulle senere skrive «The Unmasking of Robert-Houdin» der han anklaget franskmannen for å ha stjålet andres triks.' },
      { x: 68, y: 30, label: 'Kallenavnet', fact: '«Harry» kom egentlig av at moren kalte ham «Ehrie» med sin gebrokne engelskuttale.' },
    ],
    extraImages: [],
    factBox: { title: 'Historisk kontekst', body: 'Trylling gikk i denne tiden fra gatemarkedsunderholdning til finere teaterkunst — en overgang Robert-Houdin selv hadde bidratt sterkt til i Frankrike.' },
  },
  {
    key: 'kjaerlighet-pa-coney-island',
    year: '1894',
    chapter: '3 · Kjærlighet og partnerskap',
    imageAlt: 'Studioportrett av Harry Houdini og hans kone Bess, ca. 1910. Library of Congress.',
    imageFile: null,
    imageSourceFilename: 'loc-harry-bess.jpg',
    caption: 'Harry og Bess — den magiske duoen som erobret verden sammen.',
    narration: [
      'På fornøyelsesparken Coney Island traff han sangerinnen og danserinnen Wilhelmina Beatrice «Bess» Rahner.',
      'De giftet seg etter kort tid, og Bess erstattet broren Dash som hans faste assistent.',
    ],
    dialogue: [
      { speaker: 'Harry', text: 'Bess, la oss erobre verden sammen. Du tar Theos plass i illusjonen «Metamorphosis»!' },
      { speaker: 'Bess', text: 'Jeg er med deg, Harry — uansett hvor vi drar.' },
    ],
    hotspots: [
      { x: 30, y: 30, label: 'Harry', fact: 'På bildet ser vi Harry i sin karakteristiske mørke dress — han hadde en jernvilje bak det milde ansiktet.' },
      { x: 65, y: 55, label: 'Bess', fact: 'Bess var både partner på scenen og livspartner. I illusjonen Metamorphosis byttet de plass på under tre sekunder mens en av dem var låst i en kiste.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-metamorphosis.jpg', alt: 'Original plakat for «The Houdinis — Metamorphosis, change in 3 seconds» med portretter av Harry og Bessie.', caption: 'Original vaudeville-plakat for Metamorphosis.' },
    ],
    factBox: { title: 'Visste du?', body: 'Houdini opptrådte til og med i rollen som en «villmann» i jungelen som brølte og spiste rått kjøtt — paret slet voldsomt økonomisk i starten.' },
  },
  {
    key: 'vendepunktet',
    year: '1899',
    chapter: '4 · Rådet som endret alt',
    imageAlt: 'Portrett av Harry Houdini i dress, kalt «Harry Handcuff Houdini».',
    imageFile: 'scene-4-vendepunktet.jpg',
    caption: 'Et avgjørende møte i Minnesota.',
    narration: [
      'Houdini var nær ved å gi opp magien og bli låsesmed da han møtte impresarioen Martin Beck i 1899.',
      'Beck rådet ham til å droppe korttriksene og heller satse alt på utbryterkunst og håndjern.',
    ],
    dialogue: [
      { speaker: 'Martin Beck', text: 'Glem korttriksene, Houdini! Sats på håndjernene. Jeg kan gjøre deg til en stjerne.' },
      { speaker: 'Harry', text: 'Da er det offisielt: «The King of Cards» er herved «The Handcuff King»!' },
    ],
    hotspots: [
      { x: 50, y: 55, label: 'Håndjern', fact: 'Tidligere hadde Houdini titulert seg som «The King of Cards» — men andre magikere bemerket at han manglet finessen som krevdes for kortkunst.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-king-of-cards.jpg', alt: 'Fargerik litografi-plakat «Harry Houdini — King of Cards» med portrett av en ung Houdini. Library of Congress.', caption: '«King of Cards»-plakaten — tittelen Beck ba ham droppe.' },
      { file: null, sourceFilename: 'loc-portrait-1906.jpg', alt: 'Studioportrett av Houdini i hvit vest og sløyfe, ca. 1906, med håndskrevet notat om suksessen på Keith’s Theatre.', caption: 'Studioportrett fra 1906 — nå «The Handcuff King».' },
    ],
    factBox: { title: 'Historisk kontekst', body: 'Martin Beck eide vaudeville-kjeden Orpheum — en enormt populær plattform for underholdning i USA — og ga Houdini hans store gjennombrudd.' },
  },
  {
    key: 'europa-erobres',
    year: '1900',
    chapter: '5 · Europa og verdensberømmelse',
    imageAlt: 'Reklameplakat: «Tremendous Success of Houdini — The King of Handcuffs, The Sensation of London» med portrett av Houdini og attester fra Scotland Yard.',
    imageFile: null,
    imageSourceFilename: 'loc-handcuff-poster.jpg',
    caption: '«The King of Handcuffs» — Londons sensasjon anno 1900.',
    narration: [
      'Houdini tok Europa med storm da han begynte å utfordre lokalt politi til å låse ham inn i sine sikreste fengselsceller og lenker.',
      'Med enorm fysisk styrke, spesialnøkler og fantastisk «showmanship» skapte han overskrifter i by etter by.',
    ],
    dialogue: [
      { speaker: 'Britisk politi', text: 'Ingen kan bryte seg ut av Scotland Yards låser, unge mann!' },
      { speaker: 'Harry', text: 'Vi får nå se på det …' },
    ],
    hotspots: [
      { x: 50, y: 30, label: 'Portrett', fact: 'Portrettet på plakaten viser en ung, elegant Houdini — plakater som denne hang over hele London og trakk fulle hus hver kveld.' },
      { x: 20, y: 45, label: 'Scotland Yard', fact: 'Selv Scotland Yards inspektør Melville kalte prestasjonene «absolutt et mirakel» — noe som ga enorm troverdighet og publisitet.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-chains.jpg', alt: 'Houdini poserer bar overkropp med kropp og bein lenket sammen — reklamefoto brukt for å bevise at han ikke gjemte verktøy.', caption: '«Ingen skjulte verktøy» — reklamefoto fra Europa-turneen.' },
      { file: null, sourceFilename: 'loc-stone-walls.jpg', alt: 'Plakat: «Stone walls and chains do not make a prison — for Houdini». Houdini sitter lenket i en celle.', caption: '«Stone walls and chains do not make a prison — for Houdini».' },
      { file: null, sourceFilename: 'loc-prison-barrel.jpg', alt: 'Plakat «Harry Houdini, The Jail Breaker — Prison Cell & Barrel Mystery» med Houdini og små røde djevler rundt en tønne.', caption: '«Prison Cell & Barrel Mystery» — £100 til den som fant en luke.' },
    ],
    factBox: { title: 'Visste du?', body: 'PR-geniet Houdini lot seg ofte fotografere halvnaken i fengselscellene for å bevise at han ikke gjemte verktøy — det garanterte fulle hus.' },
  },
  {
    key: 'melkespann-og-tortur',
    year: '1912',
    chapter: '6 · De livsfarlige vannillusjonene',
    imageAlt: 'Houdini henger opp-ned foran Chinese Water Torture Cell med assistenter rundt seg.',
    imageFile: 'scene-6-melkespann-og-tortur.jpg',
    caption: 'Illusjonene blir stadig farligere.',
    narration: [
      'For å opprettholde spenningen introduserte Houdini livsfarlige vannillusjoner som «The Milk Can» — og senere det berømte vann-tortur-kabinettet.',
      'Han ba publikum holde pusten sammen med ham mens han forsvant under vann, for å øke den psykologiske effekten.',
    ],
    dialogue: [
      { speaker: 'Publikummer', text: 'Hjelp! Han har vært under vann i fem minutter! Lås opp før han drukner!' },
      { speaker: 'Harry (skjult bak teppet)', text: 'Ikke lås opp helt ennå — jeg leser morgendagens avis …' },
    ],
    hotspots: [
      { x: 50, y: 30, label: 'The Water Torture Cell', fact: 'Kabinettet krevde at han hang opp-ned i vann fastlåst etter beina — han måtte holde pusten i mange minutter.' },
      { x: 15, y: 55, label: 'Skjult forheng', fact: 'Ofte kom han seg lynraskt ut og satt usett bak teppet i flere minutter mens publikum fikk panikk — alt for effektens skyld.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-milk-can.jpg', alt: 'Houdini låst inne i et melkespann av metall, med hodet så vidt over kanten, flankert av to politimenn. Library of Congress.', caption: '«The Milk Can Escape» — publikum holdt pusten sammen med ham.' },
    ],
    factBox: { title: 'Historisk kontekst', body: 'Houdini brukte mye tid på å trene lungekapasiteten i et badekar fylt med iskaldt vann for å takle de fysiske påkjenningene.' },
  },
  {
    key: 'flypioner-og-filmskaper',
    year: '1910',
    chapter: '7 · Stuntmann og multitalent',
    imageAlt: 'Houdinis biplan omgitt av tilskuere på en åpen mark, ca. 1910. Library of Congress.',
    imageFile: null,
    imageSourceFilename: 'loc-biplane.jpg',
    caption: 'Houdinis biplan i 1910 — han gjennomførte Australias første registrerte flyvning.',
    narration: [
      'Houdini søkte stadig nye arenaer. Han tok med seg en Voisin-biplan til Australia og gjennomførte kontinentets første flyvning i 1910.',
      'Han satset også på stumfilm og startet sitt eget filmselskap, «Houdini Picture Corporation», for å udødeliggjøre sine bragder.',
    ],
    dialogue: [
      { speaker: 'Regissør', text: 'Er du sikker på at vi ikke skal bruke en stuntmann til dette?' },
      { speaker: 'Harry', text: 'Bare The Great Houdini gjør Houdini-stunts!' },
    ],
    hotspots: [
      { x: 55, y: 45, label: 'Voisin biplan', fact: 'Flyturen varte i omtrent to og et halvt minutt og ga enorm medieblest før forestillingene hans i Australia.' },
      { x: 25, y: 60, label: 'Publikum', fact: 'Selv en kort flytur samlet titalls tilskuere — flyvning var en ren sensasjon i 1910, og Houdini utnyttet det for alt det var verdt.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-biplane-exhibitions.jpg', alt: 'Fotomontasje av Houdini i cockpiten og biplanet hans i luften — «Houdini filled many exhibition dates in 1910». Library of Congress.', caption: '«Houdini filled many exhibition dates in 1910» — fotomontasje fra flyshowene.' },
      { file: null, sourceFilename: 'loc-straitjacket.jpg', alt: 'Houdini spennes fast i tvangstrøye av politibetjenter og assistenter foran et stort publikum. Library of Congress.', caption: 'Tvangstrøye på: Houdini forberedes til opp-ned-utbrudd utendørs.' },
      { file: null, sourceFilename: 'loc-skyscraper.jpg', alt: 'Houdini henger opp-ned fra et tau langs en amerikansk skyskraper, fastspent i tvangstrøye. Library of Congress.', caption: 'Utbrudd fra tvangstrøye i luften — hengende fra en skyskraper.' },
    ],
    factBox: { title: 'Visste du?', body: 'Utendørs opptrådte han ofte hengende i tvangstrøye opp-ned fra skyskrapere — foran titusenvis av tilskuere.' },
  },
  {
    key: 'sorg-og-spiritisme',
    year: '1922',
    chapter: '8 · Sorgen og det okkulte',
    imageAlt: 'Harry Houdini fotografert sammen med moren Cecilia og kona Bess i 1907.',
    imageFile: 'scene-8-sorg-og-spiritisme.jpg',
    caption: 'Et desperat søk etter kontakt.',
    narration: [
      'Houdini ble knust da moren døde i 1913, og han begynte å oppsøke spiritistiske medier for å finne ut om man kunne snakke med de døde.',
      'Da Lady Doyle angivelig kanaliserte moren på klingende engelsk under en seanse, forstod Houdini raskt at hun bløffet.',
    ],
    dialogue: [
      { speaker: 'Lady Doyle', text: 'Ånden skriver … «Oh my beloved son, thank God I have come through» …' },
      { speaker: 'Harry (tenker)', text: 'Det er umulig. Mor snakket kun jiddisk og litt tysk — og i dag er faktisk hennes fødselsdag, uten at ånden nevnte det!' },
    ],
    hotspots: [
      { x: 25, y: 45, label: 'Cecilia', fact: 'Cecilia Steiner Weiss var Houdinis mor. Han skrev om henne som sitt livs største kjærlighet, og tapet av henne forandret ham for alltid.' },
      { x: 75, y: 55, label: 'Bess', fact: 'Bess sto ved Harrys side hele karrieren og fortsatte å holde årlige seanser for ham i ti år etter hans død.' },
    ],
    extraImages: [],
    factBox: { title: 'Historisk kontekst', body: 'Forfatteren av Sherlock Holmes, Sir Arthur Conan Doyle, var innbitt spiritist og trodde Houdini selv hadde overnaturlige krefter — et vennskap som endte i bitter strid.' },
  },
  {
    key: 'avsloringen',
    year: '1924',
    chapter: '9 · Avsløringen av svindlerne',
    imageAlt: 'Houdini avslører et spiritistisk medium under en seanse — mediet strekker foten ut for å ringe en bjelle under bordet. Library of Congress.',
    imageFile: null,
    imageSourceFilename: 'loc-seance.jpg',
    caption: 'Houdini demonstrerer trikset: mediet ringer bjellen med tåa under bordet.',
    narration: [
      'Forkledd og under falske navn (som «Mr. White») deltok Houdini på seanser for å konfrontere og avsløre falske medier som utnyttet sørgende.',
      'Fra scenen demonstrerte han for publikum nøyaktig hvordan mediene skapte spøkelser og bankelyder ved hjelp av triks og skjult utstyr.',
    ],
    dialogue: [
      { speaker: 'Medium', text: 'Åndene ringer i bjellen! De er her!' },
      { speaker: 'Harry (drar av seg parykken)', text: 'Jeg vet hvordan dere jukser — for jeg er Den store Houdini! Du ringer bjellen med tærne!' },
    ],
    hotspots: [
      { x: 50, y: 78, label: 'Skjult fot', fact: 'Under bordet ser man foten mediet dro ut av skoen — den brukes til å ringe bjeller og løfte gjenstander i mørket.' },
      { x: 30, y: 40, label: 'Vitner', fact: 'Houdini tok med seg journalister og etterforskere til seansene så avsløringen kunne dokumenteres og publiseres.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-do-spirits-return.jpg', alt: 'Fargerik plakat: «Do Spirits Return? Houdini says NO — and proves it» — Lyceum Theatre, Paterson.', caption: '«Do Spirits Return? Houdini says NO — and proves it.»' },
    ],
    factBox: { title: 'Visste du?', body: 'Houdini vitnet i 1926 for den amerikanske Kongressen til støtte for et lovforslag som skulle forby svindlermedier å operere for profitt.' },
  },
  {
    key: 'siste-teppe-faller',
    year: '1926',
    chapter: '10 · Det siste teppet faller',
    imageAlt: 'Harry Houdini fotografert i frakk mens han går ned trappen fra en bygning i 1926 — året han døde. Library of Congress.',
    imageFile: null,
    imageSourceFilename: 'loc-1926.jpg',
    caption: 'Houdini fotografert i 1926 — hans siste leveår.',
    narration: [
      'I oktober 1926 ble Houdini, mens han var uforberedt i garderoben i Montreal, slått hardt i magen av en universitetsstudent som ville teste styrken hans.',
      'Slagene forverret en farlig blindtarmbetennelse. Kort tid etter segnet han om under en forestilling og ble fraktet til et sykehus i Detroit.',
      'Han døde på selveste Halloween-kvelden, og hele verden sørget over legenden.',
    ],
    dialogue: [],
    hotspots: [
      { x: 45, y: 25, label: 'Ansiktet i 1926', fact: 'Bildet er ett av de siste dokumenterte fotografiene av Houdini — tatt måneder før han døde 31. oktober samme år.' },
      { x: 55, y: 70, label: 'Den hemmelige koden', fact: 'Før sin død avtalte Houdini og Bess en hemmelig kode. Bess holdt årlige seanser i ti år på Halloween — men ånden hans kom aldri gjennom.' },
    ],
    extraImages: [
      { file: null, sourceFilename: 'loc-hardeen-will.jpg', alt: 'Plakat: «Hardeen inherits his brother’s secrets — Houdini’s Will» med portretter av Hardeen og Houdini og et faksimile av testamentet.', caption: 'Etter hans død: broren Theo «Hardeen» arvet triksene ifølge testamentet.' },
    ],
    factBox: { title: 'Kilder', body: 'Basert på Jan Krosby «Mannen — Myten — Legenden», Harry Ransom Center (University of Texas at Austin), HISTORY.com, Contemporary Jewish Museum og Andy Tang «Harry Houdini: The Man and His Magic».' },
  },
]

async function uploadLocalImage(filename) {
  const path = join(ASSETS_DIR, filename)
  const asset = await client.assets.upload('image', createReadStream(path), { filename })
  return asset._id
}

async function buildScene(scene, index) {
  const missing = []

  let image
  if (scene.imageFile) {
    const assetId = await uploadLocalImage(scene.imageFile)
    image = { _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt: scene.imageAlt }
    console.log(`  ✔ Lastet opp hovedbilde for «${scene.chapter}» (${scene.imageFile})`)
  } else {
    image = { _type: 'image', alt: scene.imageAlt }
    missing.push({ scene: scene.chapter, field: 'Hovedbilde', filename: scene.imageSourceFilename })
  }

  const extraImages = scene.extraImages.map((img, i) => {
    if (img.file) {
      // Ingen av tilleggsbildene er lokale i denne portingen, men koden
      // støtter det for fremtidige historier som måtte ha det.
      throw new Error('Lokal fil for extraImages er ikke implementert i dette scriptet ennå.')
    }
    missing.push({ scene: scene.chapter, field: `Ekstra bilde ${i + 1} («${img.caption ?? img.alt}»)`, filename: img.sourceFilename })
    return {
      _type: 'image',
      _key: `${scene.key}-extra-${i}`,
      alt: img.alt,
      caption: img.caption,
    }
  })

  const dialogue = scene.dialogue.map((d, i) => ({
    _type: 'comicDialogueLine',
    _key: `${scene.key}-dialogue-${i}`,
    speaker: d.speaker,
    text: d.text,
  }))

  const hotspots = scene.hotspots.map((h, i) => ({
    _type: 'comicHotspot',
    _key: `${scene.key}-hotspot-${i}`,
    x: h.x,
    y: h.y,
    label: h.label,
    fact: h.fact,
  }))

  return {
    doc: {
      _type: 'comicScene',
      _key: scene.key,
      year: scene.year,
      chapter: scene.chapter,
      image,
      caption: scene.caption,
      narration: scene.narration,
      dialogue,
      hotspots,
      factBox: scene.factBox,
      extraImages,
    },
    missing,
  }
}

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (dry run)' : ''}`)

  const existing = !dryRun && (await client.fetch(`*[_id == $id][0]{_id}`, { id: DOC_ID }))
  if (existing) {
    console.log(`✔ Dokumentet finnes allerede (${DOC_ID}) — gjør ingenting.`)
    console.log('  Rediger innholdet i Sanity Studio i stedet for å kjøre dette scriptet på nytt.')
    return
  }

  console.log('Bygger scener …')
  const allMissing = []
  const scenes = []
  for (let i = 0; i < SCENES.length; i++) {
    const { doc, missing } = await buildScene(SCENES[i], i)
    scenes.push(doc)
    allMissing.push(...missing)
  }

  const document = {
    _id: DOC_ID,
    _type: 'comicStory',
    isVisible: true,
    title: 'Harry Houdini: Mannen, Myten, Legenden',
    slug: { _type: 'slug', current: 'harry-houdini' },
    subtitle: 'Utbryterkongens utrolige reise fra fattig immigrant til verdensstjerne',
    intro:
      'Bli med på en magisk reise gjennom livet til tidenes største illusjonist. Bla nedover for å følge historien, ' +
      'og trykk på gullmerkene i bildene for å oppdage skjulte hemmeligheter og historiske fakta!',
    creditsNote:
      'Basert på materiale fra Tryllemuseets samling. Historiske foto og plakater: Library of Congress (loc.gov).',
    scenes,
  }

  if (dryRun) {
    console.log(JSON.stringify(document, null, 2))
  } else {
    await client.create(document)
    console.log(`✔ Opprettet ${DOC_ID} med ${scenes.length} scener.`)
  }

  console.log('')
  if (allMissing.length > 0) {
    console.log(`Gjenstår: ${allMissing.length} bilder må lastes opp manuelt i Sanity Studio.`)
    console.log('(Dokumentet «Harry Houdini: Mannen, Myten, Legenden» → åpne hver scene → last opp riktig bilde.)')
    console.log('')
    for (const m of allMissing) {
      console.log(`  · ${m.scene} — ${m.field}: last opp «${m.filename}»`)
    }
  } else {
    console.log('Alle bilder er lastet opp.')
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
