/**
 * syncFoolUsNordic.mjs
 *
 * Weekly job: reads the Wikipedia article for "Penn & Teller: Fool Us",
 * finds every performer marked with a Nordic flag icon (Norway, Sweden,
 * Denmark, Finland, Iceland, Faroe Islands, Greenland) in a season's guest
 * list, and makes sure each one has a tvAppearance (show: "fool-us") in
 * Sanity, creating a minimal biography stub first if the performer isn't in
 * the "Hvem er hvem" register yet.
 *
 * The article's per-season tables only hold episode metadata (No./Title/air
 * date) — performers are named in a bullet list following each episode's
 * row, one <li> per act with a flag icon, bolded when that act fooled Penn
 * & Teller and plain text otherwise. See extractSeasonAppearances() below.
 *
 * Matching (to stay idempotent across weekly runs, mirrors the youtubeId
 * pattern in importYouTubeClips.mjs):
 *   - biography: matched by name/artistName/aliases (case-insensitive),
 *     not by _id — so a hand-created biography is found and reused.
 *   - tvAppearance: matched by (magician, season, episode) or, if either
 *     side lacks season/episode, by (magician, year) — not by _id.
 *
 * Auto-created documents are flagged for editorial review rather than
 * silently trusted: biography stubs get needsUpdate: true + an editorNote
 * explaining what still needs a human (aliases, birth info, sources,
 * images). Existing documents are only ever extended (missing fields filled
 * in), never overwritten on fields an editor may have already touched
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

const WIKI_PAGE       = 'Penn & Teller: Fool Us'
const WIKI_USER_AGENT = 'TryllemuseetFoolUsSync/1.0 (+https://tryllemuseet.no)'

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
//
// The show's episode tables (one per season, columns "No.overall" / "No.
// inseason" / "Title" / "Original release date" / "Prod.code") do NOT list
// performers — Wikipedia instead follows each episode's table row with a
// bullet list naming that episode's magicians, one <li> per act, each
// prefixed with a flag icon. Acts that fooled Penn & Teller are rendered in
// bold; acts that didn't are plain text. So extraction works per season
// section (heading + everything until the next heading), walking <tr> and
// <li> elements in document order: a <tr> with several <td>s updates "the
// current episode"; any <li> found after it (however deeply nested, e.g.
// under a "website exclusives" sub-list) is one performer belonging to that
// episode.

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

function findColumnIndex($, $table, matcher) {
  const headerCells = $table.find('tr').first().find('th').toArray()
  const idx = headerCells.findIndex(th => matcher.test($(th).text()))
  return idx === -1 ? null : idx
}

function parseSeasonFromHeading(text) {
  const m = text.match(/Season\s+(\d+)/i)
  return m ? Number(m[1]) : undefined
}

function parseYearFromAirDate(text) {
  const m = text.match(/(\d{4})/)
  return m ? Number(m[1]) : undefined
}

// Splits the full article HTML into one HTML fragment per "Season N" section
// (that heading plus every sibling element up to the next h2/h3/h4).
function seasonSections($) {
  const sections = []
  $('h2, h3, h4').each((_, h) => {
    const season = parseSeasonFromHeading($(h).text())
    if (season == null) return
    const html = $(h).nextUntil('h2, h3, h4').toArray().map(el => $.html(el)).join('\n')
    sections.push({ season, html })
  })
  return sections
}

// A <li> for a performer carries a flag icon (as an <a title="…">, an
// <img alt="…"> or an <img title="…"> — Wikipedia's flagicon template isn't
// rendered identically everywhere) directly in its own content. Nested
// sub-lists (e.g. "Website exclusives") are stripped first so their flags
// aren't misattributed to the wrapping <li>.
function analyzeListItem($sec, li) {
  const $li = $sec(li).clone()
  $li.find('ul, ol').remove()

  let country = null
  const candidates = [
    ...$li.find('a').toArray().map(a => $sec(a).attr('title')),
    ...$li.find('img').toArray().map(img => $sec(img).attr('alt')),
    ...$li.find('img').toArray().map(img => $sec(img).attr('title')),
  ]
  for (const c of candidates) {
    if (c && NORDIC_COUNTRIES[c]) { country = c; break }
  }
  if (!country) return null

  // Name = text before the first comma (Wikipedia's convention is
  // "Name, short act description"); falls back to the full remaining text.
  const text = $li.text().trim().replace(/\s+/g, ' ')
  const name = (text.split(',')[0] || text).trim()
  if (!name) return null

  // Wikipedia bolds an act's whole entry when it fooled Penn & Teller, and
  // leaves it plain otherwise — so this is a reliable signal both ways.
  const boldText = $li.find('b').text().trim().replace(/\s+/g, ' ')
  const result = boldText && boldText === text ? 'fooled' : 'not_fooled'

  return { country, name, result }
}

// Walks one season's HTML fragment, tracking "the current episode" from
// table rows and attaching every performer <li> found after it (in document
// order) to that episode.
function extractSeasonAppearances(sectionHtml, season) {
  const $sec = cheerio.load(`<div>${sectionHtml}</div>`)
  const $root = $sec('div').first()
  const $table = $root.find('table.wikitable').first()

  const episodeCol = $table.length ? findColumnIndex($sec, $table, /no\.\s*in\s*season/i) : null
  const airDateCol = $table.length ? findColumnIndex($sec, $table, /release date|air date/i) : null
  const titleCol   = $table.length ? findColumnIndex($sec, $table, /title/i) : null

  let current = { episode: undefined, year: undefined, episodeTitle: undefined }
  const entries = []

  $root.find('tr, li').each((_, el) => {
    if (el.tagName === 'tr') {
      const $tds = $sec(el).children('td')
      if ($tds.length < 3) return // the guest-list row itself (one colspanned <td>), not episode metadata

      const episodeText = episodeCol != null ? $tds.eq(episodeCol).text() : ''
      const airDateText = airDateCol != null ? $tds.eq(airDateCol).text() : ''
      const titleText   = titleCol != null ? $tds.eq(titleCol).text().trim().replace(/^"|"$/g, '') : undefined
      current = {
        episode: episodeText.match(/^\s*(\d+)\s*$/) ? Number(RegExp.$1) : undefined,
        year: parseYearFromAirDate(airDateText),
        episodeTitle: titleText || undefined,
      }
      return
    }

    // <li>
    const found = analyzeListItem($sec, el)
    if (!found) return
    entries.push({ ...found, season, ...current })
    if (DEBUG) {
      console.log(`   [debug] S${season}E${current.episode ?? '?'} → ${found.name} (${found.country}, ${found.result})`)
    }
  })

  return entries
}

function extractNordicAppearances(html) {
  const $ = cheerio.load(html)
  const sections = seasonSections($)
  if (DEBUG) console.log(`   [debug] ${sections.length} sesong-seksjon(er) funnet`)
  return sections.flatMap(({ season, html: sectionHtml }) => extractSeasonAppearances(sectionHtml, season))
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
    result: entry.result,
  }
  for (const k of Object.keys(doc)) if (doc[k] === undefined) delete doc[k]

  console.log(`  +tv   ${entry.name} S${entry.season ?? '?'}E${entry.episode ?? '?'} → ${doc.result}`)
  if (!DRY_RUN) await client.createOrReplace(doc)
  return { created: true, updated: false }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('1/3  Henter artikkelen fra Wikipedia…')
const html = await fetchParsedHtml(WIKI_PAGE)
console.log(`     Kilde: "${WIKI_PAGE}"\n`)

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
