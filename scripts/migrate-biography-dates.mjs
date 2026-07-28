/**
 * migrate-biography-dates.mjs
 *
 * Extracts structured birthDate / deathDate / birthPlace (see
 * schemaTypes/partialDate.ts, schemaTypes/biography.ts) from the existing
 * free-text data on `biography` documents:
 *
 *   1. Primary source: the "F. DD.MM.YYYY. i STED. D. [DD.MM.YYYY.|YYYY.]"
 *      prefix that "Magiens Hvem er Hvem — Terje Nordheim (2005)" uses at
 *      the start of shortBio/fullBio for ~160 of the ~210 biographies.
 *      Handles missing day/month (year-only), missing "D." (person alive
 *      when the book was written), 2-digit years ("69" → 1969), and
 *      missing "i STED".
 *   2. Fallback: the free-text `years` field, for the handful of entries
 *      that don't come from the book (e.g. "1912–1995", "f. 1961").
 *
 * Every extracted date is validated (day 1–31, month 1–12, day fits the
 * month, accounting for leap years). Where the day/month portion is
 * invalid (e.g. a typo like "32.04.1961" or "31.11.1905" — November has 30
 * days), only the year is kept and the document is flagged in the report
 * printed at the end — it is never guessed at.
 *
 * Documents with no parseable date at all (mostly modern TV-contestant
 * entries with no book source, and "se X" cross-reference stub entries)
 * are left untouched and listed in the report for awareness, not as errors.
 *
 * Does NOT touch shortBio/fullBio text — only adds the new structured
 * fields. Idempotent: skips documents that already have birthDate set,
 * unless run with --force.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/migrate-biography-dates.mjs [--dry-run] [--force]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/migrate-biography-dates.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (setter birthDate/deathDate/birthPlace på biography-dokumenter). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const MONTHS_31 = new Set([1, 3, 5, 7, 8, 10, 12])
function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 }
function validDayMonth(day, month, year) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  if (month === 2) return day <= (isLeap(year) ? 29 : 28)
  if (!MONTHS_31.has(month) && day > 30) return false
  return true
}
function expandYear(yStr) {
  const y = Number(yStr)
  return yStr.length <= 2 ? 1900 + y : y
}

// "F. DD.MM.YYYY. i STED. D. [DD.MM.YYYY.|YYYY.]" — with day/month, "i STED"
// and "D. ..." all optional; year accepts 2 or 4 digits.
const FD_RE = /^F\.?\s*(?:(\d{1,2})[.\s]*[.\/](\d{1,2})[.\/]\s*)?(\d{2,4})\s*[.,]?\s*(?:i\s+([^.,]+)[.,]?\s*)?(?:D\.?\s*(?:(\d{1,2})[.\/](\d{1,2})[.\/]\s*)?(\d{2,4})\s*[.,]?)?/i

function cleanPlace(place) {
  return place.replace(/\s+Y\.?$/, '').trim()
}

function parseFromShortBio(text) {
  if (!text) return null
  const m = text.match(FD_RE)
  if (!m) return null
  const [, bd, bm, byRaw, place, dd, dm, dyRaw] = m
  if (!byRaw) return null // "F." alone with no year at all — not usable
  const result = {}

  const byYear = expandYear(byRaw)
  if (bd && bm) {
    const day = Number(bd), month = Number(bm)
    if (validDayMonth(day, month, byYear)) result.birthDate = { year: byYear, month, day }
    else { result.birthDate = { year: byYear }; result.birthInvalid = `${bd}.${bm}.${byRaw}` }
  } else {
    result.birthDate = { year: byYear }
  }

  if (place) {
    const cleaned = cleanPlace(place)
    if (cleaned) result.birthPlace = cleaned
  }

  if (dyRaw) {
    const dyYear = expandYear(dyRaw)
    if (dd && dm) {
      const day = Number(dd), month = Number(dm)
      if (validDayMonth(day, month, dyYear)) result.deathDate = { year: dyYear, month, day }
      else { result.deathDate = { year: dyYear }; result.deathInvalid = `${dd}.${dm}.${dyRaw}` }
    } else {
      result.deathDate = { year: dyYear }
    }
  }

  return result
}

// Fallback for the handful of non-book entries: "1912–1995" / "1912-1995" / "f. 1961"
function parseFromYears(years) {
  if (!years) return null
  const range = years.match(/^(\d{4})\s*[–-]\s*(\d{4})$/)
  if (range) return { birthDate: { year: Number(range[1]) }, deathDate: { year: Number(range[2]) } }
  const bornOnly = years.match(/^f\.?\s*(\d{4})$/i)
  if (bornOnly) return { birthDate: { year: Number(bornOnly[1]) } }
  return null
}

const docs = await client.fetch(`
  *[_type == "biography"]{ _id, name, shortBio, years, "hasBirthDate": defined(birthDate) }
`)
console.log(`Fant ${docs.length} biography-dokumenter.`)

const toPatch = []
const flagged = []
const noData = []

for (const doc of docs) {
  if (doc.hasBirthDate && !force) continue

  let parsed = parseFromShortBio(doc.shortBio)
  if (!parsed) parsed = parseFromYears(doc.years)

  if (!parsed) { noData.push(doc.name); continue }
  if (parsed.birthInvalid || parsed.deathInvalid) {
    flagged.push({ name: doc.name, birthInvalid: parsed.birthInvalid, deathInvalid: parsed.deathInvalid })
  }
  toPatch.push({ id: doc._id, name: doc.name, ...parsed })
}

console.log(`${toPatch.length} dokumenter kan patches med strukturert dato.`)
console.log(`${noData.length} dokumenter har ingen gjenkjennbar dato (venstår urørt).`)
console.log(`${flagged.length} dokumenter har ugyldig dag/måned i kilden — kun år er satt, resten trenger manuell sjekk:`)
for (const f of flagged) console.log(`  - ${f.name}: fødsel="${f.birthInvalid ?? ''}" død="${f.deathInvalid ?? ''}"`)

if (dryRun) {
  console.log('[dry-run] Ingen skriving utført. Eksempler:')
  for (const p of toPatch.slice(0, 10)) console.log(' ', JSON.stringify(p))
  process.exit(0)
}

const CHUNK = 40
for (let i = 0; i < toPatch.length; i += CHUNK) {
  const chunk = toPatch.slice(i, i + CHUNK)
  let tx = client.transaction()
  for (const { id, birthDate, birthPlace, deathDate } of chunk) {
    const fields = {}
    if (birthDate) fields.birthDate = birthDate
    if (birthPlace) fields.birthPlace = birthPlace
    if (deathDate) fields.deathDate = deathDate
    tx = tx.patch(id, p => p.set(fields))
  }
  await tx.commit()
  console.log(`Patchet ${Math.min(i + CHUNK, toPatch.length)} / ${toPatch.length}`)
}

console.log('Ferdig.')
