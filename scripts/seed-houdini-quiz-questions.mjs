/**
 * seed-houdini-quiz-questions.mjs
 *
 * Seeds the "Houdini" quizTheme plus a 30-question bank for the Houdini
 * exhibition: 15 questions for children (difficulty "lett") and 15 for
 * adults (difficulty "vanskelig"). The quiz frontend draws a random,
 * evenly-split selection per round, so the bank varies from visit to visit.
 *
 * Documents are published directly (not as drafts). The audience split
 * deliberately reuses the existing `difficulty` field (lett = children,
 * vanskelig = adults) instead of introducing a new schema field.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development for a dry run.
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/seed-houdini-quiz-questions.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/seed-houdini-quiz-questions.mjs
 *
 * Safe to run multiple times — uses createOrReplace with fixed _ids
 * (quiz-theme-houdini, houdini-quiz-barn-01 … houdini-quiz-voksen-15).
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-houdini-quiz-questions.mjs')
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

const THEME_ID = 'quiz-theme-houdini'
const EXHIBITION_URL = '/utstillingen/houdini'

// Each entry: [question, correctAnswer, [wrong1, wrong2, wrong3], explanation]
// The frontend shuffles answer order, so the correct answer is always listed first here.

const KIDS_QUESTIONS = [
  [
    'Hva het Harry Houdini egentlig da han ble født?',
    'Erik Weisz',
    ['Harry Weiss', 'Robert Houdin', 'Théo Hardeen'],
    'Houdini ble født som Erik Weisz i Budapest i 1874. Det magiske navnet Harry Houdini fant han på først i 1891.',
  ],
  [
    'I hvilken by ble Houdini født?',
    'Budapest',
    ['Wien', 'Praha', 'Berlin'],
    'Familien var fattig og reiste fra Budapest til Amerika da Erik var fire år gammel.',
  ],
  [
    'Hvor gammel var Houdini da han begynte å opptre i sirkus?',
    '9 år',
    ['5 år', '15 år', '20 år'],
    'Som niåring opptrådte han som trapeskunstner i et lite sirkus — lenge før han ble utbryterkonge.',
  ],
  [
    'Hva kalte han seg selv som ung sirkusartist?',
    'Prince of the Air',
    ['King of Chains', 'The Escape Boy', 'Mr. Magic'],
    'Som trapeskunstner kalte unge Erik seg «Prince of the Air» — luftens prins.',
  ],
  [
    'Hvem var Houdinis kone og faste assistent gjennom hele karrieren?',
    'Bess',
    ['Margery', 'Cecilia', 'Theo'],
    'Bess var Houdinis kone og faste scenepartner — blant annet i det lynraske byttetricket Metamorphosis.',
  ],
  [
    'Hva trodde Bess at Houdini var da hun først møtte ham?',
    'En forkledd djevel',
    ['En konge', 'En sirkusdirektør', 'En politimann'],
    'Trylletriksene hans virket nesten for magiske! Men Bess ombestemte seg fort — de giftet seg bare tre uker etter at de møttes.',
  ],
  [
    'Hva het byttetricket der Harry og broren byttet plass i en kiste?',
    'Metamorphosis',
    ['Vanishing Act', 'The Escape', 'Transformation'],
    'Harry og broren Theo byttet plass på under tre sekunder. Senere overtok kona Bess rollen som partner.',
  ],
  [
    'Hva ble Houdini kalt fordi han alltid rømte fra håndjern?',
    'Handcuff King',
    ['Lock Master', 'Chain Champion', 'The Magician'],
    'Houdini utfordret politiet over hele verden til å låse ham inne med sine beste håndjern — og rømte hver eneste gang.',
  ],
  [
    'Hvilket kjøkkenredskap rømte Houdini fra, fylt med vann?',
    'Et melkespann',
    ['En kaffekjele', 'En vannbøtte', 'Et badekar'],
    'Publikum holdt pusten i flere minutter — helt til Houdini plutselig dukket opp bak sceneteppet.',
  ],
  [
    'Hvor lenge kunne Houdini holde pusten under vann (ifølge museets «Breath-O-Meter»)?',
    'Over 3 minutter',
    ['10 sekunder', '30 sekunder', '10 minutter'],
    'Houdini trente pustekontroll i badekaret hjemme. Prøv museets Breath-O-Meter — hvor lenge klarer du?',
  ],
  [
    'Hvilket stort dyr fikk Houdini til å forsvinne på en scene i New York?',
    'En elefant',
    ['En løve', 'En hest', 'En bjørn'],
    'Elefanten veide over 4000 kilo og forsvant rett foran øynene på publikum i 1918!',
  ],
  [
    'Hva fløy Houdini med i Australia i 1910?',
    'Et fly',
    ['En ballong', 'Et luftskip', 'En drage'],
    'Houdini var blant de aller første som fløy et motorfly i Australia — bare noen få år etter at flyet ble oppfunnet.',
  ],
  [
    'Hva jobbet Houdini også med på 1920-tallet, i tillegg til å være magiker?',
    'Skuespiller i film',
    ['Fotballspiller', 'Kokk', 'Lærer'],
    'Houdini spilte hovedrollen i flere stumfilmer — og gjorde alle de farlige stuntene selv.',
  ],
  [
    'Hva samlet Houdini på – over 5000 stykker?',
    'Bøker om magi og spøkelser',
    ['Frimerker', 'Nøkler', 'Håndjern'],
    'Boksamlingen hans var en av verdens største om magi, og ble senere en del av nasjonalbiblioteket i USA.',
  ],
  [
    'På hvilken skumle høytidsdag døde Houdini?',
    'Halloween',
    ['Julaften', '17. mai', 'Nyttårsaften'],
    'Houdini døde 31. oktober 1926 — på selveste Halloween. Han gjennomførte sitt aller siste show selv om han var alvorlig syk.',
  ],
]

const ADULT_QUESTIONS = [
  [
    'Hvilket år ble Houdini født?',
    '1874',
    ['1868', '1881', '1890'],
    'Erik Weisz ble født 24. mars 1874 i Budapest, som sønn av en rabbiner.',
  ],
  [
    'Hvilket år emigrerte familien fra Ungarn til Wisconsin?',
    '1878',
    ['1874', '1885', '1899'],
    'Familien slo seg ned i Appleton, Wisconsin, og flyttet senere videre til New York, hvor de levde under svært knappe kår.',
  ],
  [
    'Hvem var Houdinis manager fra 1899, som ga ham hans store gjennombrudd?',
    'Martin Beck',
    ['Arthur Conan Doyle', 'Theo Weiss', 'Bess Rahner'],
    'Fra 1899 bygde Beck og Houdini ryktet som «The Handcuff King» gjennom offentlige rømninger fra politiceller.',
  ],
  [
    'Hvor møtte Houdini sin kommende kone Bess?',
    'Coney Island',
    ['Central Park', 'Ellis Island', 'Wisconsin'],
    'De møttes da begge opptrådte på Coney Island — og giftet seg bare tre uker senere.',
  ],
  [
    'Hvilket år giftet Houdini og Bess seg?',
    '1894',
    ['1888', '1901', '1910'],
    'Bess ble også hans faste scenepartner gjennom hele karrieren, blant annet i Metamorphosis.',
  ],
  [
    'Hvor mange dollar lovet Houdini den som klarte å lage håndjern han ikke kunne dirke opp?',
    '100 dollar',
    ['10 dollar', '50 dollar', '1000 dollar'],
    'Houdini tapte aldri veddemålet — ingen klarte å lage håndjern som holdt på ham.',
  ],
  [
    'Hva gjorde Houdini i en fengselscelle i Massachusetts for å bevise at han ikke gjemte nøkler i klærne?',
    'Rømte helt naken',
    ['Rømte i frakk', 'Nektet å delta', 'Brukte en dirk foran publikum'],
    'Ved å rømme uten klær beviste han at verken nøkler eller dirker var gjemt i tøyet — og avisene elsket det.',
  ],
  [
    'Hvilket år ble «Chinese Water Torture Cell» først fremført?',
    '1912',
    ['1905', '1918', '1923'],
    'Nummeret krevde ekstrem pustekontroll, og en assistent med øks sto alltid klar i tilfelle noe gikk galt.',
  ],
  [
    'Hvilket år fant den berømte elefant-forsvinningen på Hippodrome sted?',
    '1918',
    ['1908', '1912', '1926'],
    'Illusjonsnummeret på Hippodrome-teateret i New York bygde på storskala sceneteknikk snarere enn rømningskunst.',
  ],
  [
    'I hvilken stumfilm fra 1919 gjorde Houdini sine egne livsfarlige stunts?',
    'The Grim Game',
    ['The Master Mystery', 'Terror Island', 'Buried Alive'],
    'Under innspillingen kolliderte to fly i luften — og den ekte kollisjonen ble beholdt i filmen.',
  ],
  [
    'Hvilken bok skrev Houdini der han kritiserte sitt eget forbilde?',
    'The Unmasking of Robert-Houdin',
    ['A Magician Among the Spirits', 'Miracle Mongers', 'Metamorphosis'],
    'Ironisk nok hadde Houdini tatt kunstnernavnet sitt som en hyllest til nettopp Jean-Eugène Robert-Houdin. Boken finnes i museets bibliotek.',
  ],
  [
    'Hvem ble Houdinis tidligere venn og senere motstander i debatten om spiritisme?',
    'Sir Arthur Conan Doyle',
    ['Charles Dickens', 'H.P. Lovecraft', 'Jean Robert-Houdin'],
    'Skaperen av Sherlock Holmes var overbevist spiritist — vennskapet tålte ikke Houdinis avsløringer av falske mediumer.',
  ],
  [
    'Hvilket medium avslørte Houdini som svindler på 1920-tallet?',
    'Margery (Mina Crandon)',
    ['Madame Zora', 'Lady Grey', 'Miss Spirit'],
    'Avsløringen av «Margery» var en del av Houdinis kampanje mot falske mediumer etter morens død i 1913.',
  ],
  [
    'Hva avtalte Houdini og Bess seg imellom før han døde?',
    'Et hemmelig kodeord for kontakt fra de døde',
    ['Et arveoppgjør', 'En felles bok', 'En ny forestilling'],
    'Bess holdt seanser hver Halloween i ti år etter hans død. Kodeordet kom aldri — og hun slukket til slutt lyset hun hadde holdt tent for ham.',
  ],
  [
    'Hva var den direkte dødsårsaken til Houdini i 1926?',
    'Bristet blindtarm etter slag i magen',
    ['Drukning under et triks', 'Hjerteinfarkt', 'Fall fra en bygning'],
    'En student i Montreal slo ham i magen før han rakk å spenne musklene. Houdini insisterte likevel på å gjennomføre sitt siste show i Detroit.',
  ],
]

function toQuestionDoc(entry, index, { idPrefix, difficulty }) {
  const [question, correct, wrong, explanation] = entry
  const _id = `${idPrefix}-${String(index + 1).padStart(2, '0')}`
  return {
    _id,
    _type: 'quizQuestion',
    isVisible: true,
    question,
    answers: [
      { _type: 'answer', _key: 'a1', text: correct, isCorrect: true },
      ...wrong.map((text, i) => ({ _type: 'answer', _key: `a${i + 2}`, text, isCorrect: false })),
    ],
    explanation,
    learnMoreUrl: EXHIBITION_URL,
    learnMoreLabel: 'Utforsk Houdini-utstillingen',
    difficulty,
    themes: [{ _type: 'reference', _ref: THEME_ID, _key: 'houdini' }],
  }
}

async function run() {
  console.log(`Dataset: ${dataset}`)

  // 1. The Houdini quiz theme (selectable on the quiz start screen)
  await client.createOrReplace({
    _id: THEME_ID,
    _type: 'quizTheme',
    isVisible: true,
    title: 'Houdini',
    slug: { _type: 'slug', current: 'houdini' },
    icon: '⛓️',
    description: 'Verdens største utbryterkonge — fra utstillingen på Tryllemuseet.',
    order: 10,
  })
  console.log(`✔ Tema: Houdini (${THEME_ID})`)

  // 2. The 30 questions: 15 for children (lett) + 15 for adults (vanskelig)
  const docs = [
    ...KIDS_QUESTIONS.map((q, i) => toQuestionDoc(q, i, { idPrefix: 'houdini-quiz-barn', difficulty: 'lett' })),
    ...ADULT_QUESTIONS.map((q, i) => toQuestionDoc(q, i, { idPrefix: 'houdini-quiz-voksen', difficulty: 'vanskelig' })),
  ]
  for (const doc of docs) {
    await client.createOrReplace(doc)
    console.log(`✔ ${doc._id}: ${doc.question}`)
  }

  // 3. Verify the counts in the dataset
  const counts = await client.fetch(
    `{
      "lett": count(*[_type == "quizQuestion" && difficulty == "lett" && references($theme)]),
      "vanskelig": count(*[_type == "quizQuestion" && difficulty == "vanskelig" && references($theme)])
    }`,
    { theme: THEME_ID }
  )
  console.log('')
  console.log(`Houdini-spørsmål i datasettet: ${counts.lett} lett (barn) + ${counts.vanskelig} vanskelig (voksne)`)
  if (counts.lett !== 15 || counts.vanskelig !== 15) {
    console.warn('⚠️  Forventet 15 + 15 — sjekk i Studio.')
  } else {
    console.log('✔ Nøyaktig 15 i hver kategori.')
  }
  console.log('')
  console.log('Ferdig. Husk: nettsiden må bygges på nytt før spørsmålene vises (skjer automatisk hver natt).')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
