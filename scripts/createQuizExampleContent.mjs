/**
 * createQuizExampleContent.mjs
 *
 * Creates the quizConfig singleton plus example quiz themes and questions
 * so the tryllequiz page (/tryllequiz) can be tested with real documents.
 * The example questions are placeholders meant to be reviewed, edited or
 * replaced by the editors before the quiz is activated.
 *
 * Defaults to the DEVELOPMENT dataset (per project rules: schema/content
 * experiments go to development first).
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/createQuizExampleContent.mjs --with-user-token
 *   SANITY_DATASET=production npx sanity exec scripts/createQuizExampleContent.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_TOKEN=<token> node scripts/createQuizExampleContent.mjs
 *
 * Scriptet er trygt å kjøre flere ganger — det bruker createOrReplace
 * med faste _id-er (quiz-example-*).
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'development'

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token = process.env.SANITY_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_TOKEN=<token> node scripts/createQuizExampleContent.mjs')
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

// ── quizConfig (singleton) ────────────────────────────────────────────────────
// Created with isActive: false — the quiz stays hidden until an editor flips it.
const config = {
  _id: 'quizConfig',
  _type: 'quizConfig',
  isActive: false,
  title: 'Tryllequiz',
  intro: 'Hvor mye kan du om magiens verden? Velg tema og vanskelighetsgrad — og test deg selv!',
  comingSoonTitle: 'Tryllequizen kommer snart!',
  comingSoonText: 'Vi jobber med spørsmålene bak sceneteppet. Kom tilbake litt senere — eller besøk oss på Årvoll gård i mellomtiden!',
  questionsPerRound: 10,
  resultLevels: [
    { _key: 'lvl0', _type: 'resultLevel', minPercent: 0,  title: 'Nysgjerrig lærling',     message: 'Alle store magikere startet et sted! Utforsk museet og nettsiden — og prøv igjen.' },
    { _key: 'lvl1', _type: 'resultLevel', minPercent: 40, title: 'Lovende tryllekunstner', message: 'Ikke verst! Du kan mer enn de fleste — men magiens verden har flere hemmeligheter å by på.' },
    { _key: 'lvl2', _type: 'resultLevel', minPercent: 70, title: 'Erfaren illusjonist',    message: 'Imponerende! Du har god oversikt over magiens verden.' },
    { _key: 'lvl3', _type: 'resultLevel', minPercent: 90, title: 'Stormester i magi',      message: 'Simsalabim! Du kan nesten mer enn museet selv. Kom innom, så kan vi lære av deg!' },
  ],
}

// ── Tema ──────────────────────────────────────────────────────────────────────
const themes = [
  { _id: 'quiz-example-theme-norske-legender', title: 'Norske legender',   slug: 'norske-legender', icon: '🇳🇴', description: 'Norske tryllekunstnere gjennom tidene.', order: 1 },
  { _id: 'quiz-example-theme-magiens-historie', title: 'Magiens historie', slug: 'magiens-historie', icon: '📜', description: 'Fra oldtiden til gullalderen.', order: 2 },
  { _id: 'quiz-example-theme-tv-magi',          title: 'TV-magi',          slug: 'tv-magi',          icon: '📺', description: 'Trylling på skjermen — fra Got Talent til Fool Us.', order: 3 },
  { _id: 'quiz-example-theme-museet',           title: 'Museet',           slug: 'museet',           icon: '🎩', description: 'Om Tryllemuseet og samlingen vår.', order: 4 },
].map(t => ({
  _type: 'quizTheme',
  _id: t._id,
  isVisible: true,
  title: t.title,
  slug: { _type: 'slug', current: t.slug },
  icon: t.icon,
  description: t.description,
  order: t.order,
}))

// ── Eksempelspørsmål ──────────────────────────────────────────────────────────
// NB: Placeholder-innhold — gjennomgås og byttes ut av redaksjonen.
function question(id, fields) {
  const { question, answers, explanation, learnMoreUrl, learnMoreLabel, difficulty, themeIds } = fields
  return {
    _type: 'quizQuestion',
    _id: `quiz-example-${id}`,
    isVisible: true,
    question,
    answers: answers.map(([text, isCorrect], i) => ({
      _key: `a${i}`, _type: 'answer', text, isCorrect: isCorrect === true,
    })),
    explanation,
    learnMoreUrl,
    learnMoreLabel,
    difficulty,
    themes: (themeIds ?? []).map(ref => ({ _key: ref, _type: 'reference', _ref: ref })),
  }
}

const questions = [
  question('houdini', {
    question: 'Hva het utbryterkongen som ble verdensberømt på begynnelsen av 1900-tallet?',
    answers: [
      ['Harry Houdini', true],
      ['David Copperfield'],
      ['Howard Thurston'],
      ['Cardini'],
    ],
    explanation: 'Harry Houdini (1874–1926) tok kunstnernavnet sitt til ære for den franske magikeren Jean Eugène Robert-Houdin.',
    difficulty: 'lett',
    themeIds: ['quiz-example-theme-magiens-historie'],
  }),
  question('museet-sted', {
    question: 'Hvor holder Tryllemuseet til?',
    answers: [
      ['Årvoll gård i Oslo', true],
      ['Akershus festning'],
      ['Bryggen i Bergen'],
      ['Torvet i Trondheim'],
    ],
    explanation: 'Tryllemuseet holder til på Årvoll gård i Oslo — Norges minste, merkeligste og mest magiske museum.',
    learnMoreUrl: '/besok',
    learnMoreLabel: 'Planlegg besøket ditt',
    difficulty: 'lett',
    themeIds: ['quiz-example-theme-museet'],
  }),
  question('fool-us', {
    question: 'I hvilket TV-program prøver tryllekunstnere å lure duoen Penn & Teller?',
    answers: [
      ['Fool Us', true],
      ['Got Talent'],
      ['Masked Singer'],
      ['Kvitt eller dobbelt'],
    ],
    explanation: 'I «Penn & Teller: Fool Us» vinner man om ikke engang Penn & Teller klarer å avsløre hvordan trikset gjøres. Flere nordiske magikere har deltatt!',
    learnMoreUrl: '/tryllehistorie/fool-us',
    learnMoreLabel: 'Se de nordiske deltakerne',
    difficulty: 'lett',
    themeIds: ['quiz-example-theme-tv-magi'],
  }),
  question('robert-houdin', {
    question: 'Hvem omtales ofte som «den moderne magiens far»?',
    answers: [
      ['Jean Eugène Robert-Houdin', true],
      ['Harry Houdini'],
      ['Chung Ling Soo'],
      ['Harry Kellar'],
    ],
    explanation: 'Den franske urmakeren Robert-Houdin (1805–1871) flyttet tryllekunsten fra markedsplassen inn i teatersalongen — i vanlig aftenantrekk i stedet for trollmannskappe.',
    difficulty: 'middels',
    themeIds: ['quiz-example-theme-magiens-historie'],
  }),
  question('ibsen', {
    question: 'Hvilken berømt norsk dikter opptrådte med tryllekunster i ungdommen?',
    answers: [
      ['Henrik Ibsen', true],
      ['Knut Hamsun'],
      ['Bjørnstjerne Bjørnson'],
      ['Sigrid Undset'],
    ],
    explanation: 'Før han ble verdensberømt dramatiker, underholdt unge Henrik Ibsen med tryllekunster og buktaling.',
    learnMoreUrl: '/tryllehistorie/norske-legender/henrik-ibsen',
    learnMoreLabel: 'Les mer om Ibsen som tryllekunstner',
    difficulty: 'middels',
    themeIds: ['quiz-example-theme-norske-legender'],
  }),
  question('tryllekunst-alder', {
    question: 'Omtrent hvor langt tilbake kan tryllekunstens historie spores?',
    answers: [
      ['Over 4000 år', true],
      ['Cirka 500 år'],
      ['Cirka 1000 år'],
      ['Cirka 2000 år'],
    ],
    explanation: 'Tryllekunsten er en av verdens eldste underholdningsformer — utstillingen vår tar deg gjennom over 4000 år med magi.',
    learnMoreUrl: '/utstillingen',
    learnMoreLabel: 'Utforsk utstillingen',
    difficulty: 'vanskelig',
    themeIds: ['quiz-example-theme-magiens-historie', 'quiz-example-theme-museet'],
  }),
  question('begerspillet', {
    question: 'Hvilket triks regnes ofte som verdens eldste dokumenterte trylletriks?',
    answers: [
      ['Beger og baller (cups and balls)', true],
      ['Å sage en dame i to'],
      ['Kaninen opp av hatten'],
      ['Den svevende damen'],
    ],
    explanation: 'Beger og baller har blitt fremført i tusenvis av år og gjøres fortsatt av gatemagikere og scenekunstnere verden over.',
    difficulty: 'vanskelig',
    themeIds: ['quiz-example-theme-magiens-historie'],
  }),
  question('got-talent', {
    question: 'Hva heter talentkonkurransen der tryllekunstnere fra hele verden har slått igjennom på TV?',
    answers: [
      ['Got Talent', true],
      ['Eurovision'],
      ['Idol'],
      ['The Voice'],
    ],
    explanation: 'Got Talent-formatet finnes i over 70 land — og magikere har vunnet flere av dem. Arkivet vårt samler de nordiske deltakelsene.',
    learnMoreUrl: '/tryllehistorie/got-talent',
    learnMoreLabel: 'Se Got Talent-arkivet',
    difficulty: 'middels',
    themeIds: ['quiz-example-theme-tv-magi'],
  }),
]

// ── Kjør ──────────────────────────────────────────────────────────────────────
console.log(`Skriver quiz-eksempelinnhold til datasettet «${dataset}» ...`)

const tx = client.transaction()
tx.createOrReplace(config)
for (const doc of [...themes, ...questions]) tx.createOrReplace(doc)

const result = await tx.commit()
console.log(`✅ Ferdig — ${result.results.length} dokumenter skrevet.`)
console.log('   quizConfig er opprettet med isActive: false — quizen er fortsatt skjult.')
console.log('   Slå den på i Sanity Studio under «Quiz: Innstillinger» når dere er klare.')
