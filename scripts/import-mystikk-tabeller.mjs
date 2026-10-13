/**
 * import-mystikk-tabeller.mjs
 *
 * Phase 2 of the "Mystikk som underholdning" digitization: imports the
 * "Tabeller" appendix (pp. 175–181) transcribed in
 * scripts/data/mystikk-som-underholdning-tabeller.json as
 *   - organizationRole docs (verv + æresbevisninger: MCN/MJC/DMRO presidents,
 *     æresmedlemmer, Evig medlem, Magisk Knekt, Sandors Pris, DMROs Ærespris,
 *     Årets Tryllekunstner, Magiens trofaste riddere)
 *   - competitionResult docs (NM, junior-NM, Nordic congress 1st prizes,
 *     Nordic champions)
 *
 * Everything is created hidden (isVisible: false) — organizationRole also gets
 * needsReview: true — so nothing reaches the website before an editor has
 * checked it against the book. competitionResult has no review flag; a hidden
 * result does not show on /tryllehistorie/norden-i-fism until it is switched on.
 *
 * Idempotent: deterministic _ids + createIfNotExists, so re-runs never
 * overwrite anything edited in Studio. Competition results that already exist
 * (same year + same person, from the earlier "Norden i FISM" seed) are skipped
 * and listed, not duplicated or modified.
 *
 * Usage:
 *   node scripts/import-mystikk-tabeller.mjs --dry-run
 *   node scripts/import-mystikk-tabeller.mjs            (writes to production)
 *   SANITY_DATASET=development node scripts/import-mystikk-tabeller.mjs
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or the
 *    local Sanity CLI login; a dry run still reads from Sanity to validate
 *    references, so it needs read access too)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import { fileURLToPath } from 'url'

const dryRun = process.argv.includes('--dry-run')
const dataset = process.env.SANITY_DATASET ?? 'production'

const SOURCE_ID = 'source-magiens-hvem-er-hvem-terje-nordheim-2005'
const SOURCE_LABEL = 'Mystikk som underholdning (Nordheim & Berthelsen), Tabeller'

const COUNTRY_CODES = { Norge: 'NO', Sverige: 'SE', Danmark: 'DK', Finland: 'FI', Island: 'IS' }

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

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

  // ── Validate everything the data file points at before writing anything ──
  const lookup = await client.fetch(`{
    "orgs": *[_type == "magicOrganization" && !(_id in path("drafts.**"))]{ _id, abbreviation },
    "bios": *[_type == "biography" && !(_id in path("drafts.**"))]._id,
    "source": defined(*[_id == $sourceId][0]._id),
    "existingComp": *[_type == "competitionResult" && !(_id in path("drafts.**"))]{ _id, year, competition, personName, "bio": personRef._ref }
  }`, { sourceId: SOURCE_ID })

  const orgId = Object.fromEntries(lookup.orgs.map(o => [o.abbreviation, o._id]))
  const bioIds = new Set(lookup.bios)
  const problems = []

  if (!lookup.source) problems.push(`source-dokumentet ${SOURCE_ID} finnes ikke`)

  for (const list of data.organizationRoles) {
    if (!orgId[list.organization]) problems.push(`organisasjon ${list.organization} finnes ikke (${list.list})`)
  }
  const allEntries = [
    ...data.organizationRoles.flatMap(l => l.entries),
    ...data.competitionResults.flatMap(l => l.entries),
  ]
  for (const e of allEntries) {
    if (e.bio && !bioIds.has(e.bio)) problems.push(`biografi ${e.bio} finnes ikke (${e.name})`)
  }
  if (problems.length) {
    console.error('❌ Avbryter — datafilen peker på ting som ikke finnes:')
    for (const p of problems) console.error('   - ' + p)
    process.exit(1)
  }

  // ── Build organizationRole docs ──
  const docs = []
  const seenIds = new Set()
  const uniqueId = (base) => {
    let id = base
    for (let n = 2; seenIds.has(id); n++) id = `${base}-${n}`
    seenIds.add(id)
    return id
  }

  for (const list of data.organizationRoles) {
    for (const e of list.entries) {
      const roleTitle = e.roleTitle ?? list.roleTitle
      const doc = {
        _id: uniqueId(`orgrole-${slugify(list.organization)}-${slugify(list.roleTitle)}-${e.from ?? 'x'}-${slugify(e.name)}`),
        _type: 'organizationRole',
        isVisible: false,
        needsReview: true,
        personNameFallback: e.name,
        organization: ref(orgId[list.organization]),
        category: list.category,
        roleTitle,
        source: ref(SOURCE_ID),
        note: [e.note, `Kilde: ${SOURCE_LABEL}, s. ${list.page} («${list.list}»).`].filter(Boolean).join(' '),
      }
      if (e.bio) doc.person = ref(e.bio)
      if (e.from != null) doc.yearFrom = e.from
      if (e.to != null) doc.yearTo = e.to
      if (e.country) doc.country = e.country
      docs.push(doc)
    }
  }

  // ── Build competitionResult docs, skipping ones that already exist ──
  const skipped = []
  for (const list of data.competitionResults) {
    for (const e of list.entries) {
      const competition = e.competition ?? list.competition
      const existing = lookup.existingComp.find(c =>
        c.year === e.year &&
        // 'annet' covers older seed docs filed before nordiskKongress existed
        (c.competition === competition || c.competition === 'annet') &&
        (e.bio ? c.bio === e.bio : c.personName === e.name),
      )
      if (existing) {
        skipped.push({ year: e.year, name: e.name, list: list.list, existing })
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
        source: `${SOURCE_LABEL}, s. ${list.page}${e.host ? ` — ${e.host}` : ''}`,
      }
      if (e.bio) doc.personRef = ref(e.bio)
      if (e.location) doc.location = e.location
      if (list.category) doc.category = list.category
      if (!Object.values(COUNTRY_CODES).includes(doc.country)) {
        throw new Error(`Ugyldig landkode ${doc.country} for ${e.name} ${e.year}`)
      }
      docs.push(doc)
    }
  }

  const roles = docs.filter(d => d._type === 'organizationRole')
  const comps = docs.filter(d => d._type === 'competitionResult')
  console.log(`Klar: ${roles.length} organizationRole (${roles.filter(d => d.person).length} koblet til biografi), ` +
    `${comps.length} competitionResult (${comps.filter(d => d.personRef).length} koblet til biografi)`)

  if (skipped.length) {
    console.log(`\nHoppet over ${skipped.length} konkurranseresultat som allerede finnes (ikke endret):`)
    for (const s of skipped) {
      console.log(`   - ${s.year} ${s.name} (${s.list}) → finnes som ${s.existing._id} [${s.existing.competition}]`)
    }
  }

  if (dryRun) {
    console.log('\nEksempler:')
    console.log(JSON.stringify([roles[0], comps[0]], null, 2))
    return
  }

  if (dataset === 'production') {
    console.log('\n⚠️  Skriver til PRODUKSJONSDATASETTET om 5 sekunder (alt skjult, isVisible: false)...')
    await new Promise(r => setTimeout(r, 5000))
  }

  // createIfNotExists in chunks — never overwrites a doc that already exists.
  for (let i = 0; i < docs.length; i += 50) {
    const tx = client.transaction()
    for (const d of docs.slice(i, i + 50)) tx.createIfNotExists(d)
    await tx.commit()
    console.log(`   skrevet ${Math.min(i + 50, docs.length)}/${docs.length}`)
  }

  const counts = await client.fetch(`{
    "roles": count(*[_type == "organizationRole" && _id match "orgrole-*"]),
    "comps": count(*[_type == "competitionResult" && _id match "compresult-msu-*"])
  }`)
  console.log(`\n✅ Ferdig. I datasettet nå: ${counts.roles} organizationRole, ${counts.comps} competitionResult fra denne importen.`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
