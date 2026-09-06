/**
 * syncFoolUsNordic.mjs
 *
 * Weekly job: reads the Wikipedia episode tables for "Penn & Teller: Fool Us",
 * finds every performer marked with a Nordic flag icon (Norway, Sweden,
 * Denmark, Finland, Iceland, Faroe Islands, Greenland) next to their name,
 * and makes sure each one has a tvAppearance (show: "fool-us") in Sanity,
 * creating a minimal biography stub first if the performer isn't in the
 * "Hvem er hvem" register yet.
 *
 * Matching (to stay idempotent across weekly runs, mirrors the youtubeId
 * pattern in importYouTubeClips.mjs):
 *   - biography: matched by name/artistName/aliases (case-insensitive),
 *     not by _id — so a hand-created biography is found and reused.
 *   - tvAppearance: matched by (magician, season, episode) or, if either
 *     side lacks season/episode, by (magician, year) — not by _id.
 *
 * Auto-created documents are flagged for editorial review rather than
 * silently trusted:
 *   - biography stubs get needsUpdate: true + an editorNote explaining
 *     what still needs a human (aliases, birth info, sources, images).
 *   - tvAppearance docs whose "fooled / not fooled" outcome couldn't be
 *     read off the Wikipedia table default to result: "participant" with
 *     an editorNote asking for the real outcome to be filled in.
 * Existing documents are only ever extended (missing fields filled in),
 * never overwritten on fields an editor may have already touched
 * (result, description, featuredImage, videoUrl, videoRef, editorNote).
 *
 * Required env vars:
 *   SANITY_TOKEN   — Sanity API token with write access (fallback: SANITY_AUTH_TOKEN)
 *   SANITY_DATASET — Target dataset (default: staging — NEVER production unless explicit)
 * Optional:
 *   DRY_RUN=true   — log intended changes, make no Sanity writes
 *   DEBUG=true     — log raw table/cell HTML when a row can't be parsed cleanly
 *
 * Usage:
 *   node scripts/syncFoolUsNordic.mjs
 *   DRY_RUN=true SANITY_DATASET=production node scripts/syncFoolUsNordic.mjs
 */

import { createClient } from '@sanity/client'
import * as cheerio from 'cheerio'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID  = 'n2ynpgty'
const API_VERSION = '2024-01-01'

const SANITY_TOKEN   = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'staging'
const DRY_RUN = process.env.DRY_RUN === 'true'
const DEBUG   = process.env.DEBUG === 'true'

// Wikipedia article to read. If it turns out the episode tables live on a
// separate "List of ... episodes" page instead of inline here, WIKI_FALLBACK
// is tried next (see fetchEpisodeHtml()).
const WIKI_PAGE          = 'Penn & Teller: Fool Us'
const WIKI_FALLBACK_PAGE = 'List of Penn & Teller: Fool Us episodes'
const WIKI_USER_AGENT    = 'TryllemuseetFoolUsSync/1.0 (+https://tryllemuseet.no)'

// Country name (as it appears in Wikipedia flag-icon link titles) → Norwegian
// nationality label used on `biography.nationality`, plus the matching
// `biography.tags` entry where one exists.
const NORDIC_COUNTRIES = {
  'Norway':          { nationality: 'Norsk',     tag: 'tv-norge'   },
  'Sweden':          { nationality: 'Svensk',    tag: 'tv-sverige' },
  'Denmark':         { nationality: 'Dansk',     tag: 'tv-danmark' },
  'Finland':         { nationality: 'Finsk',     tag: 'tv-finland' },
  'Iceland':         { nationality: 'Islandsk',  tag: null         },
  'Faroe Islands':   { nationality: 'Færøysk',   tag: null         },
  'Greenland':       { nationality: 'Grønlandsk', tag: null        },
}

// ── Guards ────────────────────────────────────────────────────────────────────

if (!SANITY_TOKEN) {
  console.error('❌  SANITY_TOKEN er ikke satt.')
  process.exit(1)
}
if (SANITY_DATASET === 'production' && !DRY_RUN) {
  console.warn('⚠️  Kjører mot PRODUCTION-datasettet (skriver). Ctrl-C innen 5 sek for å avbryte.')
  await new Promise(r => setTimeout(r, 5000))
}

console.log(`📡  Dataset: ${SANITY_DATASET}${DRY_RUN ? '  (DRY RUN — ingen skriving)' : ''}\n`)

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    SANITY_DATASET,
  apiVersion: API_VERSION,
  token:      SANITY_TOKEN,
  useCdn:     false,
})

// ── Wikipedia fetch + parse ─────────────────────────────────────────────────────

async function fetchParsedHtml(page) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}` +
    `&prop=text&formatversion=2&format=json`
  const res = await fetch(url, { headers: { 'User-Agent': WIKI_USER_AGENT } })
  if (!res.ok) throw new Error(`Wikipedia API svarte ${res.status} for "${page}"`)
  const data = await res.json()
  if (data.error) throw new Error(`Wikipedia API-feil for "${page}": ${data.error.info ?? data.error.code}`)
  return data.parse.text
}

// Returns HTML containing at least one table with a "magician" column header,
// trying the main article first and a dedicated episode-list article second.
async function fetchEpisodeHtml() {
  const primary = await fetchParsedHtml(WIKI_PAGE)
  if (hasEpisodeTable(primary)) return { html: primary, page: WIKI_PAGE }

  console.log(`   "${WIKI_PAGE}" har ingen tabell med magiker-kolonne — prøver "${WIKI_FALLBACK_PAGE}"…`)
  const fallback = await fetchParsedHtml(WIKI_FALLBACK_PAGE)
  return { html: fallback, page: WIKI_FALLBACK_PAGE }
}

function hasEpisodeTable(html) {
  const $ = cheerio.load(html)
  return $('table.wikitable').toArray().some(t => findColumnIndex($, $(t)) !== null)
}

function findColumnIndex($, $table, matcher) {
  const headerCells = $table.find('tr').first().find('th').toArray()
  const idx = headerCells.findIndex(th => matcher.test($(th).text()))
  return idx === -1 ? null : idx
}

function magicianColumnIndex($, $table) {
  return findColumnIndex($, $table, /magician/i)
}

// Splits a "Magician(s)" cell into one segment per performer, since a single
// episode can feature several acts in one row (comma- or "and"-separated).
function splitPerformerSegments($cell) {
  const html = $cell.html() ?? ''
  return html
    .split(/<br\s*\/?>|,\s*(?=<span)|(?:^|\s)and\s(?=<span)/i)
    .map(s => s.trim())
    .filter(Boolean)
}

// Given one performer segment's HTML, returns { country, name } if it carries
// a Nordic flag icon, or null otherwise. Wikipedia's flagicon template isn't
// rendered identically everywhere, so this checks every plausible carrier of
// the country name: an <a title="…">, an <img alt="…">, or an <img title="…">.
function extractNordicPerformer($, segmentHtml) {
  const $seg = cheerio.load(`<div>${segmentHtml}</div>`)('div')

  let country = null
  const candidates = [
    ...$seg.find('a').toArray().map(el => $seg.find(el).attr('title')),
    ...$seg.find('img').toArray().map(el => $seg.find(el).attr('alt')),
    ...$seg.find('img').toArray().map(el => $seg.find(el).attr('title')),
  ]
  for (const c of candidates) {
    if (c && NORDIC_COUNTRIES[c]) { country = c; break }
  }
  if (!country) return null

  // The performer's own name is whatever text/link remains once the flag
  // icon's own anchor (which has no visible text, just the flag image) is
  // removed — take the last non-empty link text, falling back to the
  // segment's stripped plain text.
  const nameLinks = $seg.find('a').toArray()
    .map(a => $seg.find(a).text().trim())
    .filter(t => t && !NORDIC_COUNTRIES[t])
  const name = nameLinks.length ? nameLinks[nameLinks.length - 1] : $seg.text().trim()

  return name ? { country, name } : null
}

function parseSeasonFromHeading(text) {
  const m = text.match(/Season\s+(\d+)/i)
  return m ? Number(m[1]) : undefined
}

function parseYearFromAirDate(text) {
  const m = text.match(/(\d{4})/)
  return m ? Number(m[1]) : undefined
}

function detectResultColumn($, $table) {
  return findColumnIndex($, $table, /fool/i)
}

function parseResultCell(text) {
  const t = text.trim().toLowerCase()
  if (/^(yes|✓|✔|y)$/.test(t)) return 'fooled'
  if (/^(no|✗|✘|n)$/.test(t)) return 'not_fooled'
  return null
}

// Walks every wikitable, extracting one entry per Nordic performer found.
function extractNordicAppearances(html) {
  const $ = cheerio.load(html)
  const entries = []

  $('table.wikitable').each((_, table) => {
    const $table = $(table)
    const magicianCol = magicianColumnIndex($, $table)
    if (magicianCol === null) return

    const airDateCol   = findColumnIndex($, $table, /air date/i)
    const episodeCol   = findColumnIndex($, $table, /no\.\s*in\s*season|episode/i)
    const titleCol     = findColumnIndex($, $table, /title/i)
    const resultCol    = detectResultColumn($, $table)

    // Season number: look at the nearest preceding heading in the document.
    const heading = $table.prevAll('h2, h3, h4').first().text()
    const season = parseSeasonFromHeading(heading)

    $table.find('tr').each((__, tr) => {
      const $tds = $(tr).find('td')
      if (!$tds.length) return // header row

      const $magicianCell = $tds.eq(magicianCol)
      const segments = splitPerformerSegments($magicianCell)

      for (const seg of segments) {
        const found = extractNordicPerformer($, seg)
        if (!found) continue

        const airDateText = airDateCol !== null ? $tds.eq(airDateCol).text() : ''
        const episodeText = episodeCol !== null ? $tds.eq(episodeCol).text() : ''
        const titleText   = titleCol !== null ? $tds.eq(titleCol).text().trim().replace(/^"|"$/g, '') : undefined
        const resultText  = resultCol !== null ? $tds.eq(resultCol).text() : ''

        entries.push({
          name:     found.name,
          country:  found.country,
          season,
          episode:  episodeText ? Number(episodeText.match(/\d+/)?.[0]) : undefined,
          year:     parseYearFromAirDate(airDateText),
          episodeTitle: titleText || undefined,
          result:   parseResultCell(resultText),
        })

        if (DEBUG) {
          console.log(`   [debug] rad: season=${season} episode=${episodeText} → ${found.name} (${found.country})`)
        }
      }
    })
  })

  return entries
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function normalizeName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function tvAppearanceSlug(magicianName, year) {
  return slugify(`${magicianName}-fool-us-${year ?? ''}`)
}

// ── Existing Sanity state ────────────────────────────────────────────────────

async function loadExistingBiographies() {
  const docs = await client.fetch(`*[_type == "biography"]{ _id, name, artistName, aliases }`)
  const byName = new Map()
  for (const doc of docs) {
    const candidates = [doc.name, doc.artistName, ...(doc.aliases ?? [])].filter(Boolean)
    for (const c of candidates) byName.set(normalizeName(c), doc._id)
  }
  return byName
}

async function loadExistingAppearances() {
  const docs = await client.fetch(`
    *[_type == "tvAppearance" && show == "fool-us"]{
      _id, season, episode, year, result, "magicianId": magician._ref
    }
  `)
  const byKey = new Map()
  for (const doc of docs) {
    const key = doc.season != null && doc.episode != null
      ? `${doc.magicianId}-s${doc.season}e${doc.episode}`
      : `${doc.magicianId}-y${doc.year}`
    byKey.set(key, doc)
  }
  return byKey
}

// ── Sync logic ────────────────────────────────────────────────────────────────

async function ensureBiography(entry, existingBioByName) {
  const key = normalizeName(entry.name)
  const existingId = existingBioByName.get(key)
  if (existingId) return { id: existingId, created: false }

  const country = NORDIC_COUNTRIES[entry.country]
  const doc = {
    _id: `biography-foolus-${slugify(entry.name)}`,
    _type: 'biography',
    isVisible: true,
    name: entry.name,
    nationality: country.nationality,
    needsUpdate: true,
    editorNote:
      'Automatisk opprettet fra ukentlig Fool Us-synk (Wikipedia). Verifiser stavemåte/nasjonalitet ' +
      'og fyll ut alias, fødselsår, bilde og kilder før dette regnes som ferdig.',
    slug: { _type: 'slug', current: slugify(entry.name) },
    tags: ['fool-us', 'internasjonal', ...(country.tag ? [country.tag] : [])],
  }

  console.log(`  +bio  ${entry.name} (${country.nationality})`)
  if (!DRY_RUN) await client.createOrReplace(doc)
  existingBioByName.set(key, doc._id)
  return { id: doc._id, created: true }
}

async function ensureAppearance(entry, magicianId, existingAppearanceByKey) {
  const key = entry.season != null && entry.episode != null
    ? `${magicianId}-s${entry.season}e${entry.episode}`
    : `${magicianId}-y${entry.year}`
  const existing = existingAppearanceByKey.get(key)

  if (existing) {
    // Only fill in fields the editor hasn't already touched — never override
    // result, description, media, or an existing editorNote.
    const patch = {}
    if (existing.season == null && entry.season != null) patch.season = entry.season
    if (existing.episode == null && entry.episode != null) patch.episode = entry.episode
    if (existing.year == null && entry.year != null) patch.year = entry.year
    if (!Object.keys(patch).length) return { created: false, updated: false }

    console.log(`  ~tv   ${entry.name} S${entry.season ?? '?'}E${entry.episode ?? '?'} (fyller ut ${Object.keys(patch).join(', ')})`)
    if (!DRY_RUN) await client.patch(existing._id).set(patch).commit()
    return { created: false, updated: true }
  }

  const outcomeKnown = entry.result != null
  const doc = {
    _id: `tvappearance-foolus-${slugify(entry.name)}-${entry.season != null ? `s${entry.season}e${entry.episode ?? 0}` : `y${entry.year ?? 0}`}`,
    _type: 'tvAppearance',
    isVisible: true,
    magician: { _type: 'reference', _ref: magicianId },
    slug: { _type: 'slug', current: tvAppearanceSlug(entry.name, entry.year) },
    show: 'fool-us',
    year: entry.year ?? new Date().getFullYear(),
    season: entry.season,
    episode: entry.episode,
    episodeTitle: entry.episodeTitle,
    result: outcomeKnown ? entry.result : 'participant',
    editorNote: outcomeKnown
      ? undefined
      : 'Resultat (fooled/not fooled) kunne ikke leses pålitelig ut av Wikipedia-tabellen — sjekk og rett "Resultat".',
  }
  for (const k of Object.keys(doc)) if (doc[k] === undefined) delete doc[k]

  console.log(`  +tv   ${entry.name} S${entry.season ?? '?'}E${entry.episode ?? '?'} → ${doc.result}${outcomeKnown ? '' : ' (uverifisert)'}`)
  if (!DRY_RUN) await client.createOrReplace(doc)
  return { created: true, updated: false }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('1/3  Henter episodetabeller fra Wikipedia…')
const { html, page } = await fetchEpisodeHtml()
console.log(`     Kilde: "${page}"\n`)

console.log('2/3  Finner nordiske opptredener…')
const entries = extractNordicAppearances(html)
console.log(`     Fant ${entries.length} nordisk(e) opptreden(er)\n`)

if (!entries.length) {
  console.log('ℹ️  Ingen nordiske opptredener funnet. Hvis dette er uventet, kjør med DEBUG=true ' +
    'og sjekk at tabellstrukturen på Wikipedia-siden ikke har endret seg (kolonnenavn, flaggikoner).')
  process.exit(0)
}

console.log('3/3  Synker mot Sanity…')
const existingBioByName = await loadExistingBiographies()
const existingAppearanceByKey = await loadExistingAppearances()

let bioCreated = 0, tvCreated = 0, tvUpdated = 0, unchanged = 0

for (const entry of entries) {
  const { id: magicianId, created: bioWasCreated } = await ensureBiography(entry, existingBioByName)
  if (bioWasCreated) bioCreated++

  const { created, updated } = await ensureAppearance(entry, magicianId, existingAppearanceByKey)
  if (created) tvCreated++
  else if (updated) tvUpdated++
  else unchanged++
}

console.log(`\n✅  Ferdig — ${bioCreated} ny(e) biografi(er), ${tvCreated} ny(e) TV-opptreden(er), ` +
  `${tvUpdated} oppdatert(e), ${unchanged} uendret`)
console.log(`    Dataset: ${SANITY_DATASET}${DRY_RUN ? ' (dry run — ingenting ble faktisk skrevet)' : ''}`)
