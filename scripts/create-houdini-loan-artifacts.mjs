/**
 * create-houdini-loan-artifacts.mjs
 *
 * Creates four `artifact` documents for the escape-equipment/lock props on
 * loan from Jan Krosby for the Houdini exhibition:
 *
 *   1. Cob-håndjern fra 1898 (replika)
 *   2. Tyske jern – Clejuso No. 15
 *   3. Utbrytersett: krager, skruejern og fotlenker
 *   4. Tvangstrøye og kjettinger
 *
 * Each document is created without images — `mainImage`/`gallery` are left
 * empty and must be added later in Studio once the photos of the physical
 * objects are available. All four are marked ownerType: "loan" with
 * lenderName "Jan Krosby".
 *
 * If a `tema` document with slug "harry-houdini" exists (see
 * create-houdini-tema.mjs), the four artifacts are also appended to its
 * `content` array (as `artifactRef` entries) so they surface on the Houdini
 * hub page at /utstillingen/harry-houdini, alongside the station exhibition,
 * the kids' comic, and the quiz. This step is skipped (with a warning) if
 * that Tema doesn't exist — the artifact documents themselves are still
 * created and remain reachable via /utstillingen/artefakter regardless.
 *
 * Safe to run multiple times — uses createOrReplace with fixed _ids for the
 * artifacts, and only appends to the Tema's content array if a reference to
 * that artifact isn't already present.
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/create-houdini-loan-artifacts.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/create-houdini-loan-artifacts.mjs
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/create-houdini-loan-artifacts.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (kun nye dokumenter/referanser, ingenting eksisterende slettes). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// ── Portable text-hjelpere ──────────────────────────────────────────
let keyCounter = 0
const key = () => `k${(keyCounter++).toString(36)}`

const span = (text, marks = []) => ({ _type: 'span', _key: key(), text, marks })
const block = (children, opts = {}) => ({
  _type: 'block',
  _key: key(),
  style: opts.style ?? 'normal',
  markDefs: [],
  children,
  ...(opts.listItem ? { listItem: opts.listItem, level: opts.level ?? 1 } : {}),
})
const p = text => block([span(text)])
const h2 = text => block([span(text)], { style: 'h2' })
// parts: array av [tekst, fet?]
const bullet = (...parts) =>
  block(parts.map(([t, bold]) => span(t, bold ? ['strong'] : [])), { listItem: 'bullet' })

// ── De fire artefaktene ──────────────────────────────────────────────
const artifacts = [
  {
    _id: 'artifact-houdini-cob-handjern-1898',
    title: 'Cob-håndjern fra 1898 (replika)',
    slug: 'cob-handjern-1898',
    yearNote: '1898 (replika)',
    year: 1898,
    description:
      'Kopi av de beryktede Cob-håndjernene fra 1898 – de eneste jernene Houdini slet med å åpne etter påstått sabotasje med hagl i låsemekanismen.',
    notes: [
      h2('Cob-håndjernene fra 1898 – Den saboterte utfordringen'),
      p('Dette er en replika av de beryktede Cob-håndjernene, et av de mest myteomspunnede låseparene i Harry Houdinis karriere. De har gått inn i historien som de eneste håndjernene Houdini offisielt mislyktes i å dirke eller vri seg ut av under en offentlig utfordring.'),
      bullet(
        ['Låsemekanismen: ', true],
        ['Cob-jernene fra 1898 representerte datidens mest avanserte patentdesign, utstyrt med en intrikat innvendig fjær- og sperremekanisme som krevde ekstrem presisjon for å utløses uten originalnøkkel.', false],
      ),
      bullet(
        ['Sabotasjen: ', true],
        ['Historien forteller imidlertid at utfordringen ikke foregikk på like premisser. Noen hadde i all hemmelighet sabotert låsehuset ved å helle små blyhagl inn i mekanismen. Dette blokkerte de innvendige delene og gjorde det mekanisk umulig for selv nøkler eller tradisjonelle dirkeverktøy å vri låsen opp.', false],
      ),
      bullet(
        ['I film og populærkultur: ', true],
        ['Historien om de saboterte Cob-jernene og Houdinis dramatiske kamp mot politivesenet har blitt gjenskapt i filmatiseringer om utbryterkongens liv, blant annet vist på filmkanaler som TCM.', false],
      ),
    ],
    childText:
      'Dette er kopier av de eneste håndjernene Houdini ikke klarte å åpne, fordi noen i all hemmelighet hadde puttet bittesmå kuler inni låsen!',
  },
  {
    _id: 'artifact-houdini-clejuso-no-15',
    title: 'Tyske jern – Clejuso No. 15',
    slug: 'clejuso-no-15',
    yearNote: 'Etterkrigstid (ca. 1950–1980)',
    origin: 'Tyskland (Solingen)',
    material: 'Forniklet stål',
    description:
      'Tysk modell fra etterkrigstiden med dyp pipenøkkel og ekstra tykt stål. En moderne videreføring av de robuste tyske låsesystemene Houdini møtte på turné.',
    notes: [
      h2('Tung tysk ingeniørkunst – Arven etter Houdinis utfordringer'),
      p('Disse massive håndjernene (modell Clejuso No. 15) er produsert av den tradisjonsrike produsenten Clemen & Jung i Solingen i Tyskland. Selv om akkurat denne modellen stammer fra etterkrigstiden (1950–1980-tallet), bygger den direkte på den samme tyske låsetradisjonen som ga Harry Houdini noen av hans tøffeste utfordringer da han turnerte i Tyskland tidlig på 1900-tallet.'),
      bullet(
        ['Konstruksjon: ', true],
        ['Ekstra tykt forniklet stål med kraftige, doble låsehus som gir lite rom for bevegelse og manipulasjon.', false],
      ),
      bullet(
        ['Spesialnøkkel: ', true],
        ['Bruker en dyp, innvendig pipenøkkel med spor fremfor en flat standardnøkkel, noe som gjør mekanismen svært krevende å manipulere uten riktig verktøy.', false],
      ),
      bullet(
        ['Videreføring av tradisjon: ', true],
        ['Tyske politilåser var beryktet for sin presisjon og rå styrke, og Clejuso-serien videreførte arven av jern som krevde ekstrem mekanisk forståelse å overvinne.', false],
      ),
    ],
    childText:
      'Store, tunge jern fra Tyskland med en spesiell rørlås som er nesten umulig å dirke opp med binders eller nåler.',
    childContent: [
      h2('Arven etter de umulige tyske jernene'),
      p('Visste du at tyske håndjern var noen av de aller vanskeligste Houdini noen gang prøvde seg på?'),
      bullet(
        ['Nyere versjon: ', true],
        ['Disse store jernene ble laget i Tyskland noen tiår etter Houdinis tid, men de bygger på akkurat de samme hemmelige triksene som de gamle tyske låsesmedene brukte.', false],
      ),
      bullet(
        ['Rørlås: ', true],
        ['Nøkkelen er formet som et lite rør med hakk i enden, og låsen sitter gjemt dypt inni det tykke stålet.', false],
      ),
      bullet(
        ['Nesten umulig å lure: ', true],
        ['Her hjelper det ikke med en enkel binders eller en ståltråd. For en utbryterartist krever slike jern både superkrefter og hemmelig spesialutstyr for å åpnes!', false],
      ),
    ],
  },
  {
    _id: 'artifact-houdini-utbrytersett',
    title: 'Utbrytersett: krager, skruejern og fotlenker',
    slug: 'utbrytersett-krager-skruejern-fotlenker',
    yearNote: 'Moderne replikaer (i stil med tidlig 1900-tall)',
    material: 'Rustfritt stål (replika)',
    description:
      'Moderne scenerekvisitter i stål. Inkluderer 1800-talls skrujern (Darby-type) med gjenget nøkkel, låsbar halskrage med håndjern og fotjern tilpasset anklene.',
    notes: [
      h2('Klassiske utbryterrekvisitter og låsemekanismer'),
      p('Disse scenerekvisittene er utført i moderne børstet stål og demonstrerer de ulike typene mekanisk tvangsutstyr som utbryterartister utfordret publikum med:'),
      bullet(
        ['Skruehåndjern (Darby-type): ', true],
        ['Klassisk 1800-talls låsemekanisme uten tradisjonelt nøkkelhull. Låses opp ved å skru en gjenget pipenøkkel rett inn i tønnelåsen på hver side for å trekke tilbake den innvendige fjærlåsen.', false],
      ),
      bullet(
        ['Halskrage med håndjern: ', true],
        ['Bøylen legges rundt halsen og låses med hengelås. De integrerte håndjernene på siden benytter en tannhjuls-/skrallemekanisme som låser armene fast tett inntil halsen og brystet.', false],
      ),
      bullet(
        ['Fotjern og forankringskrage: ', true],
        ['Hengslede stålbøyler tilpasset anklene eller hals/midje. De sikres med hengelåser gjennom flensene, mens kjettingene holder bena samlet eller låser artisten fast til omgivelsene.', false],
      ),
      block([span('(Merk: På Houdinis tid ble slikt utstyr smidd i tungt støpejern, smijern eller karbonstål, mens disse er lettere replikaer i rustfritt stål).', ['em'])]),
    ],
    childText:
      'Ekte utbryterutstyr! Jern til både hals, hender og føtter, inkludert en spesiell lås man må skru opp med nøkkelen.',
    childContent: [
      h2('Kan du klare å rømme?'),
      p('Her ser du skikkelige utbryter-jern!'),
      bullet(
        ['Skrue-håndjernene: ', true],
        ['Disse har ingen vanlige nøkkelhull! For å åpne dem må du skru nøkkelen rundt som en skrue inni selve låsen.', false],
      ),
      bullet(
        ['Halskragen og håndjernene: ', true],
        ['Denne store ringen settes rundt halsen, mens hendene låses fast rett på siden. Da er det nesten umulig å bevege armene!', false],
      ),
      bullet(
        ['Fotjernene: ', true],
        ['To stålringer rundt anklene med en kjetting imellom, så man bare kan ta bittesmå museskritt.', false],
      ),
      p('Utbryterkonger som Houdini klarte å komme seg løs fra alt dette på bare noen få minutter – helt uten å bruke hendene!'),
    ],
  },
  {
    _id: 'artifact-houdini-tvangstroye-kjettinger',
    title: 'Tvangstrøye og kjettinger',
    slug: 'tvangstroye-og-kjettinger',
    yearNote: 'Moderne replika (i stil med Houdinis samtid)',
    material: 'Seilduk og lær, stålspenner',
    description:
      'Klassisk tvangstrøye i seilduk og lær med kryssede ermer, skrittstropp og kraftige kjettinger. Houdinis signaturnummer, som krevde ekstrem smidighet og lungekontroll for å skape slakk til å løsne spennene.',
    notes: [
      h2('Tvangstrøye og kjettinger – Houdinis mest dramatiske flukter'),
      p('Tvangstrøyen var opprinnelig utviklet for psykiatriske institusjoner og fengsler for å hindre personer i å skade seg selv eller andre. Harry Houdini revolusjonerte utbryterkunsten da han gjorde tvangstrøyen til et spektakulært scenenummer, ofte kombinert med tunge kjettinger og hengelåser.'),
      bullet(
        ['Konstruksjon: ', true],
        ['Laget av kraftig seilduk (canvas) forsterket med lærreimer, nagler og stålspenner. Ermene er lukket i endene og forlenger seg i lange lærstropper som krysses over brystet og spennes fast bak på ryggen. En skrittstropp hindrer at trøyen kan trekkes rett over hodet.', false],
      ),
      bullet(
        ['Kjettinger og låser: ', true],
        ['Kjettingene surres stramt rundt overkroppen og armene utenpå trøyen og sikres med flere hengelåser for å eliminere bevegelse.', false],
      ),
      bullet(
        ['Teknikken: ', true],
        ['Flukten krevde ekstrem smidighet, lungekontroll og evnen til å forskyve skuldre og albuer for å skape nok slakk til å få armene over hodet og løsne reimene med tennene eller fingrene.', false],
      ),
    ],
    childText:
      'En jakke uten åpning for hendene, der armene låses fast på ryggen og surres med kjettinger. Houdini klarte likevel å vri seg løs på bare noen få minutter!',
    childContent: [
      h2('Den umulige tvangstrøyen!'),
      p('Ser denne jakken rar ut? Det er en tvangstrøye! Den har ingen åpne ermer, og armene bindes i kryss over magen før de spennes fast bak på ryggen med sterke lærreimer. På toppen av det hele ble Houdini ofte surret inn i tunge kjettinger med store hengelåser!'),
      bullet(
        ['Hvorfor så vanskelig? ', true],
        ['Du kan ikke bruke hendene eller fingrene dine til å åpne låsene, for de er låst fast inni jakken.', false],
      ),
      bullet(
        ['Houdinis triks: ', true],
        ['Houdini måtte gjøre seg selv så «tykk» som mulig ved å fylle lungene med luft mens de strammet reimene. Når han pustet ut igjen, fikk han litt ekstra plass til å vri kroppen og lirke armene over hodet – ofte mens han hang opp ned høyt over bakken!', false],
      ),
    ],
  },
]

async function run() {
  console.log(`Dataset: ${dataset}`)

  for (const a of artifacts) {
    const doc = {
      _id: a._id,
      _type: 'artifact',
      isVisible: true,
      title: a.title,
      slug: { _type: 'slug', current: a.slug },
      description: a.description,
      ownerType: 'loan',
      lenderName: 'Jan Krosby',
      category: 'rekvisitt',
      ...(a.year ? { year: a.year } : {}),
      ...(a.yearNote ? { yearNote: a.yearNote } : {}),
      ...(a.origin ? { origin: a.origin } : {}),
      ...(a.material ? { material: a.material } : {}),
      notes: a.notes,
      childText: a.childText,
      ...(a.childContent ? { childContent: a.childContent } : {}),
      tags: ['houdini', 'utbryterutstyr'],
    }
    await client.createOrReplace(doc)
    console.log(`✔ Artefakt opprettet: "${a.title}" (${a._id}) — /utstillingen/artefakter/${a.slug}`)
  }

  console.log('')
  console.log('ℹ️  Ingen bilder er lagt til ennå — mainImage/gallery må fylles inn i Studio når foto av gjenstandene er tilgjengelig.')

  // ── Koble til Houdini-temaet, hvis det finnes ──────────────────────
  const temaDoc = await client.fetch(`*[_type == "tema" && slug.current == "harry-houdini"][0]{ _id, content }`)

  if (!temaDoc) {
    console.log('')
    console.log('⚠️  Fant ikke tema-dokumentet med slug "harry-houdini" — hopper over kobling til Houdini-hub-siden.')
    console.log('   Artefaktene er likevel synlige på /utstillingen/artefakter.')
    return
  }

  const existingRefs = new Set((temaDoc.content ?? []).map(c => c._ref))
  const newRefs = artifacts
    .filter(a => !existingRefs.has(a._id))
    .map(a => ({ _type: 'artifactRef', _key: `artifact-${a.slug}`, _ref: a._id }))

  if (newRefs.length === 0) {
    console.log('')
    console.log('✔ Alle fire artefaktene er allerede koblet til tema-houdini.')
    return
  }

  await client.patch(temaDoc._id).setIfMissing({ content: [] }).append('content', newRefs).commit()
  console.log('')
  console.log(`✔ La til ${newRefs.length} artefakt-referanse(r) i tema-houdini (${temaDoc._id}) — vises nå på /utstillingen/harry-houdini.`)
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
