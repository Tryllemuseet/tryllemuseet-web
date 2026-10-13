/**
 * import-mystikk-tabeller.mjs
 *
 * Phase 2 of the "Mystikk som underholdning" digitization: imports the book's
 * tables (pp. 175–186), transcribed in
 * scripts/data/mystikk-som-underholdning-tabeller.json, as
 *   - historicalSection docs — one per table in the book (title, intro text,
 *     footnote, book order); pp. 182–186 (foreign visitors, bibliography) are
 *     sections with rich text only
 *   - organizationRole docs (verv + æresbevisninger)
 *   - competitionResult docs (NM, junior-NM, Nordic congresses/champions)
 * Every role/result points at its section; each section's `tab` decides where
 * it is rendered (/tryllehistorie/konkurransehistorie or
 * /tryllehistorie/foreningshistorie).
 *
 * Everything is created hidden (isVisible: false; roles also needsReview:
 * true), so nothing reaches the website before it is switched on.
 *
 * Re-runs are safe:
 *   - docs that don't exist yet are created
 *   - docs this script created earlier are brought up to date with the data
 *     file ONLY if nothing has changed them since they were created (no
 *     draft, _updatedAt within TOUCH_TOLERANCE_MS of _createdAt); anything
 *     edited since — in Studio or by an earlier update run — is left alone
 *     and listed
 *   - competition results that pre-date this import (same year + person, from
 *     the earlier "Norden i FISM" seed) are not duplicated; they only get
 *     `section` (and the congress name as `category`, the city as
 *     `location`) set where missing
 *
 * Usage:
 *   node scripts/import-mystikk-tabeller.mjs --dry-run
 *   node scripts/import-mystikk-tabeller.mjs            (writes to production)
 *   SANITY_DATASET=development node scripts/import-mystikk-tabeller.mjs
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or the
 *    local Sanity CLI login; a dry run still reads from Sanity)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'

const dryRun = process.argv.includes('--dry-run')
const dataset = process.env.SANITY_DATASET ?? 'production'

const SOURCE_ID = 'source-magiens-hvem-er-hvem-terje-nordheim-2005'
const SOURCE_LABEL = 'Mystikk som underholdning (Nordheim & Berthelsen)'
const COUNTRY_CODES = ['NO', 'SE', 'DK', 'FI', 'IS']

// A doc whose _updatedAt is within this window of its _createdAt counts as
// untouched (a fresh create stamps both at commit time).
const TOUCH_TOLERANCE_MS = 5_000

function getStoredToken() {
  try {
    const config = JSON.parse(readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf-8'))
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

if (!token) {
  console.error('❌ Mangler token. Kjør: npx sanity login  (eller sett SANITY_API_TOKEN)')
  process.exit(1)
}

const client = createClient({ projectId: 'n2ynpgty', dataset, apiVersion: '2024-01-01', token, useCdn: false })

const here = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(here, 'data', 'mystikk-som-underholdning-tabeller.json'), 'utf-8'))

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const ref = (_ref) => ({ _type: 'reference', _ref })

// Book order within a table. Several data-file lists can feed one section
// (MJC presidents + MCN's junior consultant), so offset by the list's position
// among the lists for that section.
function tableOrder(list, entry) {
  const lists = [...data.organizationRoles, ...data.competitionResults].filter(l => l.section === list.section)
  return lists.indexOf(list) * 1000 + (list.entries.indexOf(entry) + 1) * 10
}
const sectionId = (slug) => `histsection-msu-${slug}`

// Data-file blocks ({ style, parts: [{ text, strong?, em? }] }) → Portable Text.
function toPortableText(blocks, keyPrefix) {
  return blocks.map((b, i) => ({
    _type: 'block',
    _key: `${keyPrefix}b${i}`,
    style: b.style ?? 'normal',
    markDefs: [],
    children: b.parts.map((part, j) => ({
      _type: 'span',
      _key: `${keyPrefix}b${i}s${j}`,
      text: part.text,
      marks: [part.strong && 'strong', part.em && 'em'].filter(Boolean),
    })),
  }))
}

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

  const lookup = await client.fetch(`{
    "orgs": *[_type == "magicOrganization" && !(_id in path("drafts.**"))]{ _id, abbreviation },
    "bios": *[_type == "biography" && !(_id in path("drafts.**"))]._id,
    "source": defined(*[_id == $sourceId][0]._id),
    "existingComp": *[_type == "competitionResult" && !(_id in path("drafts.**"))]{
      _id, year, competition, personName, category, location, tableOrder, "bio": personRef._ref, "section": section._ref
    },
    "mine": *[(_id match "orgrole-*" || _id match "compresult-msu-*" || _id match "histsection-msu-*")
              && !(_id in path("drafts.**"))]{ _id, _createdAt, _updatedAt },
    "drafts": *[_id in path("drafts.**") && (_id match "drafts.orgrole-*" || _id match "drafts.compresult-*"
                || _id match "drafts.histsection-*" || _id match "drafts.comp-*")]._id
  }`, { sourceId: SOURCE_ID })

  const orgId = Object.fromEntries(lookup.orgs.map(o => [o.abbreviation, o._id]))
  const bioIds = new Set(lookup.bios)
  const sectionSlugs = new Set(data.sections.map(s => s.slug))
  const problems = []

  if (!lookup.source) problems.push(`source-dokumentet ${SOURCE_ID} finnes ikke`)
  for (const s of data.sections) {
    if (s.organization && !orgId[s.organization]) problems.push(`organisasjon ${s.organization} finnes ikke (seksjon ${s.slug})`)
  }
  for (const list of [...data.organizationRoles, ...data.competitionResults]) {
    if (!sectionSlugs.has(list.section)) problems.push(`seksjon ${list.section} mangler i datafilen (${list.list})`)
    if (list.organization && !orgId[list.organization]) problems.push(`organisasjon ${list.organization} finnes ikke (${list.list})`)
    for (const e of list.entries) {
      if (e.bio && !bioIds.has(e.bio)) problems.push(`biografi ${e.bio} finnes ikke (${e.name})`)
    }
  }
  if (problems.length) {
    console.error('❌ Avbryter — datafilen peker på ting som ikke finnes:')
    for (const p of problems) console.error('   - ' + p)
    process.exit(1)
  }

  const docs = []
  const seenIds = new Set()
  const uniqueId = (base) => {
    let id = base
    for (let n = 2; seenIds.has(id); n++) id = `${base}-${n}`
    seenIds.add(id)
    return id
  }

  // ── historicalSection ──
  for (const s of data.sections) {
    const intro = s.blocks ?? (s.intro ?? []).map(t => ({ style: 'normal', parts: [{ text: t }] }))
    const doc = {
      _id: sectionId(s.slug),
      _type: 'historicalSection',
      isVisible: false,
      title: s.title,
      slug: { _type: 'slug', current: s.slug },
      order: s.order,
      tab: s.tab,
      source: ref(SOURCE_ID),
    }
    if (intro.length) doc.introText = toPortableText(intro, `${slugify(s.slug).slice(0, 12)}-`)
    if (s.footnote) doc.footnote = s.footnote
    if (s.organization) doc.relatedOrganization = ref(orgId[s.organization])
    docs.push(doc)
  }

  // ── organizationRole ──
  for (const list of data.organizationRoles) {
    for (const e of list.entries) {
      const doc = {
        _id: uniqueId(`orgrole-${slugify(list.organization)}-${slugify(list.roleTitle)}-${e.from ?? 'x'}-${slugify(e.name)}`),
        _type: 'organizationRole',
        isVisible: false,
        needsReview: true,
        personNameFallback: e.name,
        organization: ref(orgId[list.organization]),
        category: list.category,
        roleTitle: e.roleTitle ?? list.roleTitle,
        section: ref(sectionId(list.section)),
        tableOrder: tableOrder(list, e),
        source: ref(SOURCE_ID),
      }
      if (e.bio) doc.person = ref(e.bio)
      if (e.from != null) doc.yearFrom = e.from
      if (e.to != null) doc.yearTo = e.to
      if (e.country) doc.country = e.country
      if (e.note) doc.note = e.note
      const internal = [e.internalNote, `Kilde: ${SOURCE_LABEL}, s. ${list.page} («${list.list}»).`].filter(Boolean)
      doc.internalNotes = internal.join(' ')
      docs.push(doc)
    }
  }

  // ── competitionResult ──
  const legacyPatches = []
  for (const list of data.competitionResults) {
    for (const e of list.entries) {
      const competition = e.competition ?? list.competition
      const category = e.category ?? list.category
      const existing = lookup.existingComp.find(c =>
        !c._id.startsWith('compresult-msu-') &&
        c.year === e.year &&
        // 'annet' covers older seed docs filed before nordiskKongress existed
        (c.competition === competition || c.competition === 'annet') &&
        (e.bio ? c.bio === e.bio : c.personName === e.name),
      )
      if (existing) {
        const set = {}
        if (!existing.section) set.section = ref(sectionId(list.section))
        if (!existing.category && category) set.category = category
        if (!existing.location && e.location) set.location = e.location
        if (existing.tableOrder == null) set.tableOrder = tableOrder(list, e)
        legacyPatches.push({ id: existing._id, set, label: `${e.year} ${e.name}` })
        continue
      }
      const doc = {
        _id: uniqueId(`compresult-msu-${slugify(competition)}-${e.year}-${slugify(e.name)}`),
        _type: 'competitionResult',
        isVisible: false,
        personName: e.name,
        country: e.country ?? 'NO',
        competition,
        year: e.year,
        placement: e.placement ?? list.placement,
        section: ref(sectionId(list.section)),
        tableOrder: tableOrder(list, e),
        source: `${SOURCE_LABEL}, s. ${list.page}`,
      }
      if (e.bio) doc.personRef = ref(e.bio)
      if (e.location) doc.location = e.location
      if (category) doc.category = category
      if (!COUNTRY_CODES.includes(doc.country)) throw new Error(`Ugyldig landkode ${doc.country} for ${e.name} ${e.year}`)
      docs.push(doc)
    }
  }

  // ── Decide create / update / leave alone ──
  const mine = new Map(lookup.mine.map(d => [d._id, d]))
  const drafts = new Set(lookup.drafts.map(id => id.replace(/^drafts\./, '')))
  const toCreate = []
  const toReplace = []
  const edited = []
  for (const doc of docs) {
    const current = mine.get(doc._id)
    if (!current) { toCreate.push(doc); continue }
    const untouched = !drafts.has(doc._id) &&
      Math.abs(Date.parse(current._updatedAt) - Date.parse(current._createdAt)) <= TOUCH_TOLERANCE_MS
    if (untouched) toReplace.push(doc)
    else edited.push(doc._id)
  }
  const legacyToPatch = legacyPatches.filter(p => Object.keys(p.set).length && !drafts.has(p.id))
  // Fields added to the data file after a doc was created reach edited docs
  // too, but only where the doc doesn't have them yet.
  const ADDED_LATER = { historicalSection: ['tab'], organizationRole: ['tableOrder'], competitionResult: ['tableOrder'] }
  const fillMissing = docs
    .filter(d => edited.includes(d._id) && ADDED_LATER[d._type] && !drafts.has(d._id))
    .map(d => ({ id: d._id, setIfMissing: Object.fromEntries(ADDED_LATER[d._type].map(k => [k, d[k]]).filter(([, v]) => v != null)) }))

  const count = (arr, type) => arr.filter(d => d._type === type).length
  for (const type of ['historicalSection', 'organizationRole', 'competitionResult']) {
    console.log(`${type}: ${count(toCreate, type)} nye, ${count(toReplace, type)} oppdateres, ` +
      `${docs.filter(d => d._type === type && edited.includes(d._id)).length} endret siden opprettelse (røres ikke)`)
  }
  console.log(`Eldre konkurranseresultater som kobles til seksjon: ${legacyToPatch.length} av ${legacyPatches.length}`)
  if (fillMissing.length) console.log(`Endrede dokumenter som får nye felt der de mangler: ${fillMissing.length}`)
  for (const p of legacyPatches) console.log(`   - ${p.label} → ${p.id} ${Object.keys(p.set).length ? JSON.stringify(Object.keys(p.set)) : '(allerede satt)'}`)
  if (edited.length) {
    console.log('\nEndret siden opprettelse (i Studio eller av en tidligere kjøring) — oppdateres ikke:')
    for (const id of edited) console.log('   - ' + id)
  }

  if (dryRun) return

  if (dataset === 'production') {
    console.log('\n⚠️  Skriver til PRODUKSJONSDATASETTET om 5 sekunder (alt nytt er skjult, isVisible: false)...')
    await new Promise(r => setTimeout(r, 5000))
  }

  const ops = [
    ...toCreate.map(d => tx => tx.createIfNotExists(d)),
    // Untouched since our own last write: bring fully up to date, but keep
    // isVisible as-is in case it has already been switched on via a script.
    ...toReplace.map(d => tx => tx.patch(d._id, {
      set: Object.fromEntries(
        Object.entries(d).filter(([k]) => !k.startsWith('_') && k !== 'isVisible' && k !== 'needsReview'),
      ),
      ...(d._type === 'organizationRole' && !d.note ? { unset: ['note'] } : {}),
    })),
    ...legacyToPatch.map(p => tx => tx.patch(p.id, { set: p.set })),
    ...fillMissing.map(p => tx => tx.patch(p.id, { setIfMissing: p.setIfMissing })),
  ]
  for (let i = 0; i < ops.length; i += 50) {
    const tx = client.transaction()
    for (const op of ops.slice(i, i + 50)) op(tx)
    await tx.commit()
    console.log(`   skrevet ${Math.min(i + 50, ops.length)}/${ops.length}`)
  }

  const counts = await client.fetch(`{
    "sections": count(*[_type == "historicalSection" && _id match "histsection-msu-*"]),
    "roles": count(*[_type == "organizationRole" && defined(section)]),
    "comps": count(*[_type == "competitionResult" && defined(section)])
  }`)
  console.log(`\n✅ Ferdig. ${counts.sections} seksjoner, ${counts.roles} verv/æresbevisninger og ${counts.comps} konkurranseresultater koblet til en seksjon.`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
