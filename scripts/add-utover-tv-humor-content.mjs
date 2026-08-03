/**
 * add-utover-tv-humor-content.mjs
 *
 * Content follow-up to the "Digital innholdsintegrasjon" mapping doc, sections
 * 4-6 (utøver-profiler / TV-humor / arkivopptak). Uses the biography.videos
 * field and reverse-linked historicalClip archive added in PR #125.
 *
 * - Creates 2 new biography documents (Kevin Lunde, Jon Ensor) — neither
 *   existed before.
 * - Appends videos/links entries to 4 existing biographies (Alexx Alexxander,
 *   Christian Wedøy, Daniel Larsen) without touching their existing entries
 *   (uses setIfMissing + insert, never overwrites).
 * - Creates 1 new historicalClip document (Finn Jon — "The Best of Magic",
 *   1989), linked via the `magician` reference so it surfaces automatically
 *   on his biography page's "Arkivopptak" section.
 *
 * All URLs were verified via web search before inclusion. Two items from the
 * source mapping doc were dropped for lack of a verifiable link: Daniel
 * Larsen's NRK "Fin Fredag" clip with Arne Scheie, and Tom Henning Thorsen's
 * second (2023, ring magic) Norske Talenter appearance — see editorNote /
 * PR description.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/add-utover-tv-humor-content.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN).')
  process.exit(1)
}

const key = () => Math.random().toString(36).slice(2, 14)

const newBiographies = [
  {
    _id: 'biography-lunde-kevin',
    _type: 'biography',
    isVisible: true,
    name: 'Lunde, Kevin',
    slug: { _type: 'slug', current: 'kevin-lunde' },
    artistName: 'Kevin Lunde',
    nationality: 'Norsk',
    tags: ['norsk', 'profesjonell', 'tv-norge'],
    shortBio: 'Norsk magiker og entertainer, kjent som programleder og magiker i NRKs Rundlurt (2014) — Norges første TV-serie viet til trylling. Har over 25 års erfaring på scenen, med hovedvekt på bedriftsarrangementer og humormagi.',
    videos: [
      { _key: key(), _type: 'video', title: 'Rundlurt — «hacker» telefonen til Jonna', url: 'https://www.youtube.com/watch?v=Cj3ToSoStX8', type: 'tv', year: 2014 },
    ],
    links: [
      { _key: key(), _type: 'link', label: 'Offisiell nettside', type: 'website', url: 'https://www.kevin.no/' },
      { _key: key(), _type: 'link', label: 'Instagram', type: 'instagram', url: 'https://www.instagram.com/kevinlunde/' },
      { _key: key(), _type: 'link', label: 'Facebook', type: 'facebook', url: 'https://www.facebook.com/kevinlunde/' },
    ],
    editorNote: 'Fulle Rundlurt-episoder er ikke tilgjengelig for strømming (visningsrettighetene har utløpt per NRK TV, aug. 2026) — kun enkeltklipp på YouTube er brukt over.',
  },
  {
    _id: 'biography-ensor-jon',
    _type: 'biography',
    isVisible: true,
    name: 'Ensor, Jon',
    slug: { _type: 'slug', current: 'jon-ensor' },
    artistName: 'Jon Ensor',
    nationality: 'Britisk-norsk',
    birthPlace: 'Oxford, England',
    tags: ['profesjonell', 'mentalist'],
    shortBio: 'Britisk-norsk magiker, mentalist og foredragsholder. Startet med magi som åtteåring, profesjonell fra han var 16, og har vært heltids entertainer siden 2000. Flyttet til Norge i 2010 og har siden etablert seg som en av de mest brukte bedrifts- og eventmagikerne i det norske markedet. Har opptrådt for det britiske kongehuset, og gjestet NRKs Lindmo og Big Bang.',
    videos: [
      { _key: key(), _type: 'video', title: 'TEDxArendal: Who needs tricks? Charisma has magical powers.', url: 'https://www.youtube.com/watch?v=aGSOzytAVx0', type: 'annet', year: 2019 },
      { _key: key(), _type: 'video', title: 'Showreel', url: 'https://www.youtube.com/watch?v=miSKsS_LtDo', type: 'opptreden' },
    ],
    links: [
      { _key: key(), _type: 'link', label: 'Offisiell nettside', type: 'website', url: 'https://www.jonensor.com/' },
      { _key: key(), _type: 'link', label: 'YouTube-kanal', type: 'youtube', url: 'https://www.youtube.com/@ensormagic' },
      { _key: key(), _type: 'link', label: 'NRK Big Bang — høydepunkter (Facebook)', type: 'other', url: 'https://www.facebook.com/jonensormagician/videos/jon-ensor-vs-scientists-on-nrk-big-bang-highlights/1046229602224602/' },
    ],
  },
]

// Appended to existing docs — never overwrites what's already there.
const patches = [
  { _id: 'biography-alexxander-alexx', field: 'videos', items: [
    { title: 'Magic Showreel', url: 'https://www.youtube.com/watch?v=c-CyJlQU8Jw', type: 'opptreden' },
    { title: 'The Magic of Alexx Alexxander — ON TOUR (trailer)', url: 'https://www.youtube.com/watch?v=AWNImhkHU3g', type: 'opptreden' },
  ] },
  { _id: 'biography-alexxander-alexx', field: 'links', items: [
    { label: 'YouTube-kanal', type: 'youtube', url: 'https://www.youtube.com/@alexxalexxander' },
  ] },
  { _id: 'biography-christian-wedoy', field: 'links', items: [
    { label: 'Got Talent — spilleliste (YouTube)', type: 'youtube', url: 'https://www.youtube.com/playlist?list=PLemKNnubXda8pdfG9JhwKxno3wKJ06cqp' },
    { label: 'Undervannsutbryting — spilleliste (YouTube)', type: 'youtube', url: 'https://www.youtube.com/playlist?list=PLemKNnubXda-AQ-gMiWBngklv72v5akXK' },
  ] },
  { _id: 'biography-larsen-daniel', field: 'videos', items: [
    { title: 'Showreel — Master of Magic', url: 'https://www.youtube.com/watch?v=9C_B5gruMSw', type: 'opptreden' },
  ] },
]

const newHistoricalClips = [
  {
    _id: 'historicalclip-finn-jon-best-of-magic-1989',
    _type: 'historicalClip',
    isVisible: true,
    magician: { _type: 'reference', _ref: 'biography-hauger-finn-jon' },
    slug: { _type: 'slug', current: 'finn-jon-best-of-magic-1989' },
    title: 'Finn Jon — The Best of Magic (1989)',
    year: 1989,
    broadcaster: 'annet',
    show: 'The Best of Magic (John Fisher, Storbritannia)',
    category: 'show',
    videoUrl: 'https://www.youtube.com/watch?v=JZTlbOlXQpY',
    source: 'MagicWeek Video Archive',
    editorNote: 'Opprinnelig sendt 20. sept. 1989. Del av MagicWeeks videoarkiv over internasjonale magikere fra samme program.',
  },
]

if (dataset === 'production' && !dryRun) {
  console.log(`⚠️  Du skriver til PRODUKSJONSDATASETTET (${newBiographies.length} nye biography, ${patches.length} patcher, ${newHistoricalClips.length} nytt historicalClip). Venter 5 sekunder...`)
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// Guard: don't clobber if any of these already exist (re-run safety).
const allNewIds = [...newBiographies, ...newHistoricalClips].map(d => d._id)
const existingNew = await client.fetch(`*[_id in $ids]{_id}`, { ids: allNewIds })
const existingNewIds = new Set(existingNew.map(d => d._id))

if (dryRun) {
  console.log(`[dry-run] ville opprettet ${newBiographies.length} biography-dokumenter:`)
  for (const d of newBiographies) console.log(`  ${d._id}${existingNewIds.has(d._id) ? ' (finnes allerede — hoppes over)' : ''}`)
  console.log(`[dry-run] ville opprettet ${newHistoricalClips.length} historicalClip-dokument(er):`)
  for (const d of newHistoricalClips) console.log(`  ${d._id}${existingNewIds.has(d._id) ? ' (finnes allerede — hoppes over)' : ''}`)
  console.log(`[dry-run] ville patchet ${patches.length} felt på eksisterende dokumenter:`)
  for (const p of patches) console.log(`  ${p._id} -> ${p.field} (+${p.items.length})`)
  process.exit(0)
}

let created = 0
for (const doc of [...newBiographies, ...newHistoricalClips]) {
  if (existingNewIds.has(doc._id)) {
    console.log(`↷ ${doc._id} finnes allerede — hopper over.`)
    continue
  }
  await client.createIfNotExists(doc)
  created++
  console.log(`✓ Opprettet ${doc._id}`)
}

for (const { _id, field, items } of patches) {
  const withKeys = items.map(item => ({ _key: key(), _type: field === 'videos' ? 'video' : 'link', ...item }))
  await client
    .patch(_id)
    .setIfMissing({ [field]: [] })
    .insert('after', `${field}[-1]`, withKeys)
    .commit()
  console.log(`✓ Patchet ${_id}.${field} (+${items.length})`)
}

console.log(`Ferdig. ${created} nye dokumenter opprettet, ${patches.length} felt patchet.`)
