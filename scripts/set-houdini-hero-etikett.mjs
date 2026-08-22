/**
 * set-houdini-hero-etikett.mjs
 *
 * Sets the new homepage.heroBannere[].etikett kicker field (see
 * schemaTypes/homepage.ts) on the existing Houdini hero banner slide
 * (href "/utstillingen/houdini") to "Høstens hovedutstilling" — the
 * suggested copy from the launch-scoping note that made Houdini fall
 * 2026's headline exhibition.
 *
 * Deliberately additive and narrow: patches a single field on a single
 * array item of the one published `homepage` singleton, matching every
 * other item and every other field untouched. Does NOT touch
 * `drafts.homepage` — that draft currently has no heroBannere content at
 * all (looks like an abandoned/in-progress edit unrelated to this
 * change), and guessing at how to reconcile someone else's draft is out
 * of scope here.
 *
 * Safe to run multiple times (idempotent — sets the same value).
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/set-houdini-hero-etikett.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/set-houdini-hero-etikett.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (ett felt på homepage.heroBannere). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function run() {
  const homepageId = await client.fetch(`*[_type == "homepage" && !(_id in path("drafts.**"))][0]._id`)
  if (!homepageId) {
    console.error('❌ Fant ingen publisert homepage-dokument.')
    process.exit(1)
  }

  const banner = await client.fetch(
    `*[_id == $id][0].heroBannere[href == "/utstillingen/houdini"][0]{ _key, etikett, tekstLinje1 }`,
    { id: homepageId },
  )
  if (!banner?._key) {
    console.error('❌ Fant ingen hero-banner med href "/utstillingen/houdini" på homepage.')
    process.exit(1)
  }

  console.log(`Fant banner "${banner.tekstLinje1}" (_key: ${banner._key}), nåværende etikett: ${JSON.stringify(banner.etikett)}`)
  console.log('Ny etikett: "Høstens hovedutstilling"')
  console.log(`\nOppdaterer: ${homepageId}`)

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  await client
    .patch(homepageId)
    .set({ [`heroBannere[_key=="${banner._key}"].etikett`]: 'Høstens hovedutstilling' })
    .commit()

  console.log('\n✅ Oppdatert.')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
