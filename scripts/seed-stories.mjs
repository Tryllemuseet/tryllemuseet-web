/**
 * seed-stories.mjs
 *
 * Seeds the first three «Liten historie» (story) documents — the weekly
 * short anecdotes shown at /tryllehistorie/historier and as «Ukens historie»
 * on the frontpage:
 *
 *   1. Da «åndene» skapte en tryllekunstner   (publishes 2026-07-27)
 *   2. Kvinnen i kassen                        (publishes 2026-08-03)
 *   3. Da Houdini fikk en elefant til å forsvinne (publishes 2026-08-10)
 *
 * publishedAt dates are one week apart at 05:00 UTC, so each story goes
 * live on that morning's 05:30 daily rebuild — no manual step needed.
 *
 * Uses createIfNotExists with fixed _ids, so re-runs never overwrite
 * stories that have since been edited in Studio. Also inserts a section
 * card for /tryllehistorie/historier into the tryllehistoriePage document
 * (skipped if a card with that href already exists).
 *
 * Targets the PRODUCTION dataset by default (explicitly requested for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-stories.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-stories.mjs')
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

// Plain paragraphs → Portable Text blocks with stable keys.
function paragraphs(id, texts) {
  return texts.map((text, i) => ({
    _type: 'block',
    _key: `${id}-p${i + 1}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${id}-p${i + 1}-s1`, text, marks: [] }],
  }))
}

const stories = [
  {
    _id: 'story-da-andene-skapte-en-tryllekunstner',
    _type: 'story',
    isVisible: true,
    title: 'Da «åndene» skapte en tryllekunstner',
    slug: { _type: 'slug', current: 'da-andene-skapte-en-tryllekunstner' },
    publishedAt: '2026-07-27T05:00:00Z',
    featuredDurationDays: 7,
    teaser:
      'Cheltenham 1865: Davenport-brødrenes åndeskap skulle bevise åndenes eksistens. I salen satt urmakeren John Nevil Maskelyne — og så noe helt annet.',
    body: paragraphs('davenport', [
      'Se for dere rådhuset i Cheltenham i mars 1865. På scenen sitter de amerikanske Davenport-brødrene fastbundet inne i et stort skap. Dørene lukkes. I mørket begynner bjeller å ringe og musikkinstrumenter å spille. Når skapet åpnes, sitter brødrene tilsynelatende fortsatt bundet. Mange i publikum mener å ha sett ånder i arbeid.',
      'Men blant tilskuerne sitter urmakeren John Nevil Maskelyne. Han legger merke til noe som får ham til å tro at fenomenene kan gjenskapes helt uten overnaturlige krefter.',
      'Sammen med møbelsnekkeren George Alfred Cooke bygger han sitt eget åndeskap. Allerede i juni viser de frem tilsvarende fenomener for publikum – åpent presentert som tryllekunst og knep. Opptrinnet blir starten på deres profesjonelle karriere. Fra 1873 etablerer Maskelyne og Cooke seg i Egyptian Hall i London, der de blir værende i mer enn tretti år.',
      'En forestilling som skulle bevise åndenes eksistens, bidro altså i stedet til å skape en av britisk tryllehistories viktigste karrierer.',
    ]),
    sourceNote:
      'Peter Lane og Anne Goulden, The Davenport Brothers in Britain 1864–1865, basert på samtidige britiske avisoppslag; se også Cheltenham Chronicle, 15. og 22. august 1865.',
  },
  {
    _id: 'story-kvinnen-i-kassen',
    _type: 'story',
    isVisible: true,
    title: 'Kvinnen i kassen – illusjonen som forandret scenemagien',
    slug: { _type: 'slug', current: 'kvinnen-i-kassen' },
    publishedAt: '2026-08-03T05:00:00Z',
    featuredDurationDays: 7,
    teaser:
      'London 1921: P. T. Selbit binder en assistent, legger henne i en trekasse — og sager tvers gjennom. Slik blir et av tryllekunstens mest kjente bilder til.',
    body: paragraphs('selbit', [
      'London, 17. januar 1921. På scenen i Finsbury Park Empire står den britiske tryllekunstneren P. T. Selbit – egentlig Percy Thomas Tibbles – foran en trekasse som minner om en kiste.',
      'En kvinnelig assistent blir bundet ved håndledd, ankler og hals før hun plasseres i kassen. Tauendene føres ut gjennom åpninger og holdes stramme. Deretter lukkes lokket, kassen legges vannrett, og Selbit begynner å sage tvers gjennom den med en stor håndsag.',
      'Publikum ser ikke assistentens hode eller føtter, slik vi ofte gjør i nyere varianter. Nettopp derfor må fantasien fylle kassen – og forestille seg hva sagbladet møter der inne.',
      'Når kassen åpnes, kommer assistenten uskadd ut. Selbits nummer, kalt Sawing Through a Woman, blir en sensasjon. Andre tryllekunstnere lager raskt egne og mer synlige varianter.',
      'Slik oppstår et av tryllekunstens mest kjente bilder: mennesket som tilsynelatende deles i to – og likevel reiser seg igjen.',
    ]),
    sourceNote:
      'Reuters’ omtale av hundreårsjubileet og Jim Steinmeyer, Art and Artifice: And Other Essays of Illusion (2006). Selbits opptreden regnes vanligvis som den moderne illusjonens første offentlige scenevisning.',
  },
  {
    _id: 'story-da-houdini-fikk-en-elefant-til-a-forsvinne',
    _type: 'story',
    isVisible: true,
    title: 'Da Houdini fikk en elefant til å forsvinne',
    slug: { _type: 'slug', current: 'da-houdini-fikk-en-elefant-til-a-forsvinne' },
    publishedAt: '2026-08-10T05:00:00Z',
    featuredDurationDays: 7,
    teaser:
      'New York 1918: Elefanten Jennie går inn i et kabinett på Hippodrome-scenen. Houdini fyrer av en pistol — og fire og et halvt tonn er borte.',
    body: paragraphs('elefant', [
      'New York, 7. januar 1918. På den enorme scenen i Hippodrome Theatre står Harry Houdini, allerede verdensberømt for å rømme fra håndjern, kasser og lenker. Men denne gangen er det ikke Houdini som skal forsvinne.',
      'Inn på scenen kommer elefanten Jennie, omkring fire og et halvt tonn tung. Hun går inn i et stort kabinett, og forhengene lukkes rundt henne. Publikum vet at elefanten er der – et dyr av denne størrelsen kan verken gjemmes i en lomme eller snike seg ubemerket ut.',
      'Houdini løfter en pistol og fyrer av. Forhengene åpnes. Jennie er borte.',
      'Nummeret blir en sensasjon, ikke bare fordi en elefant tilsynelatende forsvinner, men fordi det skjer på en sterkt opplyst scene foran et enormt publikum. Houdini har gjort et klassisk trylleprinsipp større enn noen kunne forestille seg.',
      'Han beviser samtidig noe viktig: I tryllekunst er størrelsen på hemmeligheten mindre viktig enn størrelsen på opplevelsen.',
    ]),
    sourceNote:
      'Library of Congress har bevart fotografier og katalogopplysninger fra forestillingen, datert 1918. Se også Kenneth Silverman, Houdini!!! The Career of Ehrich Weiss (1996).',
  },
]

// Section card for the /tryllehistorie landing grid. The build-time
// auto-badge in getTryllehistoriePage() overrides the badge text.
const historierCard = {
  _key: 'historier',
  href: '/tryllehistorie/historier',
  emoji: '✨',
  title: 'Små historier fra tryllekunsten',
  sub: 'Ukens historie',
  desc: 'Korte fortellinger fra magiens historie — én liten historie i uken, fra åndeskap og gullaldermagikere til norske kuriositeter.',
  badge: 'Historier',
  soon: false,
}

console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

for (const story of stories) {
  if (dryRun) {
    console.log(`  ville opprettet: «${story.title}» (${story._id}), publiseres ${story.publishedAt}`)
    continue
  }
  const existing = await client.fetch('*[_id == $id][0]._id', { id: story._id })
  await client.createIfNotExists(story)
  console.log(
    existing
      ? `  «${story.title}» finnes allerede — hoppet over (createIfNotExists).`
      : `✔ Opprettet «${story.title}», publiseres ${story.publishedAt}.`
  )
}

// Add the section card to the live tryllehistoriePage document, after the
// «Hvem skulle trodd?» card. If the document has no seksjoner array, the
// frontend's code fallback (which includes the card) applies — skip.
const page = await client.fetch(
  `*[_type == "tryllehistoriePage" && !(_id in path("drafts.**"))][0]{
    _id,
    "hasSeksjoner": defined(seksjoner),
    "hasCard": count(seksjoner[href == "/tryllehistorie/historier"]) > 0
  }`
)

if (!page?._id) {
  console.log('  Fant ikke tryllehistoriePage-dokumentet — seksjonskortet kommer fra kode-fallbacken.')
} else if (!page.hasSeksjoner) {
  console.log('  tryllehistoriePage har ingen seksjoner-liste — kode-fallbacken (med kortet) gjelder.')
} else if (page.hasCard) {
  console.log('  Seksjonskortet for /tryllehistorie/historier finnes allerede — hoppet over.')
} else if (dryRun) {
  console.log(`  ville lagt inn seksjonskortet «${historierCard.title}» på ${page._id}`)
} else {
  await client
    .patch(page._id)
    .insert('after', 'seksjoner[href == "/tryllehistorie/hvem-skulle-trodd"]', [historierCard])
    .commit()
  console.log(`✔ Seksjonskort «${historierCard.title}» lagt inn på ${page._id}.`)
  const draft = await client.fetch('*[_id == "drafts." + $id][0]._id', { id: page._id })
  if (draft) {
    console.log('⚠️  Det finnes en kladd (draft) av tryllehistorie-siden i Studio — publiser eller forkast den,')
    console.log('    ellers vises ikke det nye kortet i Studio-skjemaet før kladden er borte.')
  }
}
