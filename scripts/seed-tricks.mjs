/**
 * seed-tricks.mjs
 *
 * Seeds the five "Lær et triks" trick documents authored July 2026
 * (content from Davidos Tryllebok via nb.no, rewritten in the museum's own
 * words — see the Notion page «Lær et triks – gjenstående oppgaver»).
 *
 * Video links are deliberately left out: every candidate video must be
 * embed-checked manually (YouTube blocks automated checks) before being
 * pasted into the documents in Studio.
 *
 * Uses createIfNotExists with fixed _ids, so re-runs never overwrite
 * documents that have been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-tricks.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-tricks.mjs')
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

// Portable Text helpers — deterministic keys make re-runs diff-stable.
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

function instructions(idPrefix, steps, tips) {
  const blocks = steps.map((text, i) => block(idPrefix, i + 1, text, 'number'))
  if (tips) blocks.push(block(idPrefix, steps.length + 1, `Tips: ${tips}`))
  return blocks
}

const TRICKS = [
  {
    _id: 'trick-den-hoppende-strikken',
    title: 'Den hoppende strikken',
    slug: 'den-hoppende-strikken',
    difficulty: 'enkel',
    order: 1,
    shortDescription:
      'Du trer en strikk rundt to fingre. Med et lite knips hopper strikken plutselig over til de to andre fingrene — helt av seg selv!',
    materials: ['En vanlig strikk (gummistrikk)'],
    steps: [
      'Tre strikken rundt pekefingeren og langfingeren din. Dra litt i strikken og slipp den et par ganger, så alle ser at det bare er en helt vanlig strikk.',
      'Dra strikken ut til en lang løkke, og stikk alle fire fingrene inn i den. Snu hånden din om nesten samtidig, så det ser ut som du bare knytter neven. Strikken ligger fortsatt rundt pekefingeren og langfingeren — i hvert fall ser det sånn ut!',
      'Rett ut fingrene dine. I akkurat det øyeblikket hopper strikken over til ringfingeren og lillefingeren!',
    ],
    tips:
      'Øv foran et speil noen ganger før du viser det til noen. Det viktigste er at du snur hånden og retter ut fingrene i étt rolig, jevnt sving — ikke for fort, ikke for nølende. Da ser det ut som ren magi!',
  },
  {
    _id: 'trick-den-forheksede-binders',
    title: 'Den forheksede binders',
    slug: 'den-forheksede-binders',
    difficulty: 'middels',
    order: 2,
    shortDescription:
      'En binders henger midt på en strikk mellom hendene dine. Uten at du beveger hendene eller strikken, begynner bindersen plutselig å krype sakte bortover av seg selv!',
    materials: [
      'En vanlig gummistrikk',
      'En binders (eller lån en ring av noen og klipp av en strikk så den får to ender)',
    ],
    steps: [
      'Tre bindersen inn på midten av strikken.',
      'Ta tak i hver sin ende av strikken med tommel og pekefinger på hver hånd. La en liten tapp av strikken stikke ut på hver side, men skjul endene bak fingrene dine.',
      'Stram strikken godt, med bindersen hengende midt på.',
      'Uten at noen ser det, slipper du litt opp grepet på den ene siden, slik at strikken sakte glir gjennom fingrene dine. Da ser det ut som bindersen kryper av seg selv!',
      'Stopp når du kjenner enden av strikken nærme seg tommelen. Stram strikken igjen, få bindersen tilbake til midten, og gjenta — denne gangen lar du den krype den andre veien.',
    ],
    tips: null,
  },
  {
    _id: 'trick-matematikk-geniet',
    title: 'Matematikk-geniet',
    slug: 'matematikk-geniet',
    difficulty: 'middels',
    order: 3,
    shortDescription:
      'Du og en venn skriver fem femsifrede tall under hverandre — og du klarer å regne ut summen i hodet, raskere enn noen rekker å taste den inn på en kalkulator!',
    materials: ['Papir og penn (gjerne en kalkulator for å sjekke svaret etterpå)'],
    steps: [
      'Be vennen din skrive et hvilket som helst femsifret tall øverst på arket.',
      'Be vennen skrive et nytt femsifret tall rett under.',
      'Nå skriver du selv det tredje tallet — hemmeligheten er at hvert siffer du skriver, sammen med sifferet rett over, skal bli 9 (under en 1-er skriver du 8, under en 2-er skriver du 7, og så videre).',
      'Vennen din skriver et nytt, valgfritt tall som fjerde rad.',
      'Du skriver det femte og siste tallet, etter akkurat samme regel som i steg 3.',
      'Nå kan du skrive svaret med én gang: se på det aller første tallet vennen din skrev, trekk 2 fra siste sifferet, og sett et 2-tall foran hele tallet. Det er svaret!',
    ],
    tips: 'Øv på å finne «9-paret» til hvert siffer (1↔8, 2↔7, 3↔6, 4↔5, 0↔9) til det sitter automatisk.',
  },
  {
    _id: 'trick-krype-gjennom-postkort',
    title: 'Å krype gjennom et postkort',
    slug: 'a-krype-gjennom-et-postkort',
    difficulty: 'middels',
    order: 4,
    shortDescription:
      'Du klipper et helt vanlig postkort til étt kjempestort hull — stort nok til at du faktisk kan krype gjennom det!',
    materials: ['Et postkort (eller et stivt ark/papp)', 'En saks'],
    steps: [
      'Brett postkortet dobbelt på langs.',
      'Klipp hakk inn fra den brettede kanten, med omtrent 1 cm mellomrom. Hakkene skal gå nesten over til motsatt side, men ikke helt igjennom.',
      'Snu kortet og klipp hakk fra den andre langsiden også — disse skal gå mellom hakkene du klippet først.',
      'Klipp til slutt langs midtbretten, nesten fra ende til ende (ikke helt ut i kantene).',
      'Åpne forsiktig ut kortet. Nå er det blitt én kjempelang løkke du kan dra ut og krype gjennom!',
    ],
    tips: 'Spør en voksen om hjelp med saksen hvis du er usikker, og øv gjerne på et vanlig ark først.',
  },
  {
    _id: 'trick-houdini-ringene',
    title: 'Houdini-ringene',
    slug: 'houdini-ringene',
    difficulty: 'middels',
    order: 5,
    shortDescription:
      'Fem ringer er tredd fast på et tau som en tilskuer holder i begge ender. Under et lommetørkle løser du dem fra hverandre — helt uten at tilskueren merker noe!',
    materials: [
      '5 gardinringer (gjerne malt i fire ulike farger)',
      'Et tau eller en snor',
      'Et lommetørkle',
    ],
    steps: [
      'Lag en løkke midt på tauet. Tre den første ringen gjennom løkken, og stikk begge endene av tauet gjennom denne løkken — dette ser stramt og fast ut, men kan faktisk løses opp igjen.',
      'Tre de fire andre ringene på hver sin tauende, og la dem gli ned mot den første ringen.',
      'La en tilskuer holde i hver sin ende av tauet, og legg lommetørkleet over ringene.',
      'Under tørkleet: slakk på løkken og dra den rundt den nederste ringen. Nå er plutselig alle ringene løse!',
      'Ta løs ringene én etter én og legg dem på bordet — men la den aller nederste ringen henge igjen.',
      'Før du tar bort tørkleet, knytter du den ene ringen fast igjen, akkurat som i utgangspunktet.',
    ],
    tips: 'Denne krever mest forberedelse og øvelse av de fire — mal gjerne ringene i ulike farger så publikum lettere følger med.',
  },
]

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

  for (const t of TRICKS) {
    const doc = {
      _id: t._id,
      _type: 'trick',
      isVisible: true,
      title: t.title,
      slug: { _type: 'slug', current: t.slug },
      difficulty: t.difficulty,
      shortDescription: t.shortDescription,
      materials: t.materials,
      instructions: instructions(t._id, t.steps, t.tips),
      order: t.order,
    }
    if (dryRun) {
      console.log(`  ville opprettet: ${doc._id} («${doc.title}», ${doc.difficulty}, ${t.steps.length} steg)`)
      continue
    }
    await client.createIfNotExists(doc)
    console.log(`✔ ${t.title} (${t._id})`)
  }

  if (!dryRun) {
    const count = await client.fetch(`count(*[_type == 'trick'])`)
    console.log('')
    console.log(`Verifisering: ${count} trick-dokumenter i datasettet.`)
    console.log('Husk: video-lenker legges inn manuelt i Studio etter embed-sjekk (se Notion-siden).')
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
