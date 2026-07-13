/**
 * seed-verdens-mest-fism.mjs
 *
 * Imports the "Verdens mest… trylletriks" (worldRecordTrick, 5 docs) and
 * "Norden i FISM" (competitionResult, 42 docs) seed data from the ndjson
 * files in the repo root, then links the person references to the matching
 * biography documents in "Hvem er hvem".
 *
 * Uses createIfNotExists + setIfMissing throughout, so re-runs never
 * overwrite content or references that have been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development for a dry run
 * against another dataset, or pass --dry-run to only print what would be
 * written.
 *
 * Usage:
 *   node scripts/seed-verdens-mest-fism.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-verdens-mest-fism.mjs')
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

// Person links, verified against the production biography register July 2026.
// worldRecordTrick uses `relatedPerson`; competitionResult uses `personRef`.
const WRT_PERSON_LINKS = {
  'wrt-finn-jon-loops': 'biography-hauger-finn-jon',
  'wrt-davido-guinness': 'biography-fevaag-bjoern-david',
}

const COMP_PERSON_LINKS = {
  'comp-fism-1985-16': 'biography-fevaag-bjoern-david',
  'comp-fism-1982-18': 'biography-fevaag-bjoern-david',
  'comp-davido-nm-junior': 'biography-fevaag-bjoern-david',
  'comp-davido-nm-senior': 'biography-fevaag-bjoern-david',
  'comp-fism-1964-21': 'biography-hauger-finn-jon',
  'comp-jancrosby-nm-1973': 'biography-krosby-jan',
  'comp-jancrosby-nm-1974': 'biography-krosby-jan',
  'comp-jancrosby-nm-1993': 'biography-krosby-jan',
  'comp-jancrosby-nordisk-1971': 'biography-krosby-jan',
  'comp-jancrosby-nordisk-1973': 'biography-krosby-jan',
  'comp-jancrosby-vm-1967': 'biography-krosby-jan',
  'comp-toreno-mcn-1956': 'biography-fredriksen-tore',
  'comp-toreno-nordisk-1964': 'biography-fredriksen-tore',
  'comp-bertido-nm-1994': 'biography-frydenberg-bernt',
  'comp-alexxander-nordisk-1999': 'biography-alexxander-alexx',
}

function readNdjson(file) {
  return readFileSync(file, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line))
}

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

  const worldRecords = readNdjson('worldrecordtrick-seed.ndjson')
  const compResults = readNdjson('competitionresult-seed.ndjson')
  console.log(`Lest: ${worldRecords.length} worldRecordTrick + ${compResults.length} competitionResult`)

  if (worldRecords.length !== 5 || compResults.length !== 42) {
    console.error('❌ Uventet antall dokumenter i seed-filene (forventet 5 + 42). Avbryter.')
    process.exit(1)
  }

  // 1. Import (createIfNotExists — never overwrites existing docs)
  if (!dryRun) {
    const tx = client.transaction()
    for (const doc of [...worldRecords, ...compResults]) tx.createIfNotExists(doc)
    await tx.commit()
    console.log('✔ Import fullført (createIfNotExists)')
  } else {
    for (const doc of [...worldRecords, ...compResults]) console.log(`  ville opprettet: ${doc._id}`)
  }

  // 2. Verify the biography targets actually exist before linking
  const targetIds = [...new Set([...Object.values(WRT_PERSON_LINKS), ...Object.values(COMP_PERSON_LINKS)])]
  const found = await client.fetch(`*[_id in $ids]._id`, { ids: targetIds })
  const missing = targetIds.filter(id => !found.includes(id))
  if (missing.length) {
    console.warn(`⚠️  Biografidokumenter som ikke finnes (hopper over koblinger til disse): ${missing.join(', ')}`)
  }

  // 3. Link person references (setIfMissing — never overwrites manual edits)
  const links = [
    ...Object.entries(WRT_PERSON_LINKS).map(([docId, bioId]) => ({ docId, bioId, field: 'relatedPerson' })),
    ...Object.entries(COMP_PERSON_LINKS).map(([docId, bioId]) => ({ docId, bioId, field: 'personRef' })),
  ].filter(l => !missing.includes(l.bioId))

  for (const { docId, bioId, field } of links) {
    if (dryRun) {
      console.log(`  ville koblet: ${docId}.${field} → ${bioId}`)
      continue
    }
    await client
      .patch(docId)
      .setIfMissing({ [field]: { _type: 'reference', _ref: bioId } })
      .commit()
    console.log(`✔ ${docId}.${field} → ${bioId}`)
  }

  // 4. Verify
  if (!dryRun) {
    const counts = await client.fetch(`{
      'wrt': count(*[_type == 'worldRecordTrick']),
      'comp': count(*[_type == 'competitionResult']),
      'wrtLinked': count(*[_type == 'worldRecordTrick' && defined(relatedPerson)]),
      'compLinked': count(*[_type == 'competitionResult' && defined(personRef)]),
    }`)
    console.log('')
    console.log(`Verifisering: ${counts.wrt} worldRecordTrick (${counts.wrtLinked} med person), ${counts.comp} competitionResult (${counts.compLinked} med person)`)
    if (counts.wrt !== 5 || counts.comp !== 42) {
      console.error('❌ Antall stemmer ikke med forventet 5 + 42.')
      process.exit(1)
    }
    console.log('Ferdig. NB: «wrt-davido-guinness» står med «Trenger verifisering» — avklares mot primærkilde før prod.')
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
