/**
 * seed-kabinett-rooms.mjs
 *
 * Seeds the "Det trettende kabinett" content documents: the gameConfig
 * singleton (with isActive: false — the museum flips that switch, never
 * this script) and one gameChapter document per room, prefilled with the
 * default copy from the game code so editors can see and edit the texts
 * in Studio.
 *
 * The room copy is read directly from DEFAULT_ROOMS in
 * web/src/pages/det-trettende-kabinett.astro — single source of truth,
 * nothing is duplicated here.
 *
 * Uses createIfNotExists with fixed _ids, so re-runs never overwrite
 * documents that have been edited in Studio, and never touch isActive.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-kabinett-rooms.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-kabinett-rooms.mjs')
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

// Extract the DEFAULT_ROOMS object literal from the game page source.
function loadDefaultRooms() {
  const source = readFileSync('web/src/pages/det-trettende-kabinett.astro', 'utf-8')
  const marker = 'const DEFAULT_ROOMS'
  const start = source.indexOf(marker)
  if (start === -1) throw new Error('Fant ikke DEFAULT_ROOMS i det-trettende-kabinett.astro')
  const braceStart = source.indexOf('{', source.indexOf('=', start))
  let depth = 0
  let end = -1
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { end = i + 1; break }
    }
  }
  if (end === -1) throw new Error('Fant ikke slutten på DEFAULT_ROOMS-objektet')
  // The literal is plain data (strings/arrays/objects) — safe to evaluate.
  return new Function(`return (${source.slice(braceStart, end)})`)()
}

async function run() {
  console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

  const rooms = loadDefaultRooms()
  const keys = Object.keys(rooms)
  console.log(`Fant ${keys.length} rom i DEFAULT_ROOMS`)

  const configDoc = {
    _id: 'gameConfig',
    _type: 'gameConfig',
    isActive: false,
    title: 'Det trettende kabinett',
    intro:
      'Et tryllemuseum som bare finnes mellom midnatt og daggry. Direktøren tar opp én lærling per generasjon — og i natt står dørene åpne.',
    comingSoonTitle: 'Dørene er ennå låst …',
    comingSoonText:
      'Det trettende kabinett åpner snart for sin neste lærling. Kom tilbake litt senere — eller besøk oss på Årvoll gård i mellomtiden!',
  }

  // Since July 2026 each DEFAULT_ROOMS entry also carries an `en` block
  // (English defaults); seed those into the parallel *En fields so editors
  // can QA the English copy in Studio.
  const chapterDocs = keys.map(key => {
    const room = rooms[key]
    const en = room.en ?? {}
    const enFacts = en.facts ?? []
    return {
      _id: `game-room-${key}`,
      _type: 'gameChapter',
      isVisible: true,
      key,
      title: room.title,
      intro: room.intro,
      ...(en.title ? { titleEn: en.title } : {}),
      ...(en.intro ? { introEn: en.intro } : {}),
      facts: (room.facts ?? []).map((fact, i) => ({
        _type: 'gameFact',
        _key: `game-room-${key}-fact-${i + 1}`,
        text: fact.text,
        ...(enFacts[i]?.text ? { textEn: enFacts[i].text } : {}),
        ...(fact.linkUrl ? { linkUrl: fact.linkUrl } : {}),
        ...(fact.linkLabel ? { linkLabel: fact.linkLabel } : {}),
        ...(enFacts[i]?.linkLabel ? { linkLabelEn: enFacts[i].linkLabel } : {}),
      })),
    }
  })

  if (dryRun) {
    console.log(`  ville opprettet: gameConfig (isActive: false)`)
    for (const doc of chapterDocs) {
      console.log(`  ville opprettet: ${doc._id} («${doc.title}», ${doc.facts.length} fakta)`)
    }
    return
  }

  const tx = client.transaction()
  tx.createIfNotExists(configDoc)
  for (const doc of chapterDocs) tx.createIfNotExists(doc)
  await tx.commit()
  console.log(`✔ gameConfig + ${chapterDocs.length} rom-dokumenter (createIfNotExists)`)

  const counts = await client.fetch(`{
    'config': count(*[_type == 'gameConfig']),
    'chapters': count(*[_type == 'gameChapter']),
    'active': *[_type == 'gameConfig'][0].isActive,
  }`)
  console.log('')
  console.log(`Verifisering: ${counts.config} gameConfig, ${counts.chapters} gameChapter. isActive: ${counts.active}`)
  if (counts.active === true) {
    console.log('NB: spillet står som AKTIVT — det er museets bryter og er ikke rørt av dette scriptet.')
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
