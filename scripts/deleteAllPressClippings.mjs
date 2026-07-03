/**
 * deleteAllPressClippings.mjs
 *
 * One-off script — deletes ALL pressClipping documents (published + drafts)
 * from the target dataset. Irreversible without a prior export backup:
 *
 *   npx sanity dataset export production pressclipping-backup-<YYYYMMDD>.tar.gz
 *
 * The pressClipping schema itself is left untouched — this removes data only.
 *
 * Required env vars:
 *   SANITY_TOKEN    — Sanity API token (editor or write)
 *
 * Optional env vars:
 *   SANITY_DATASET  — Target dataset (default: staging — pass 'production' explicitly)
 *
 * Usage:
 *   node scripts/deleteAllPressClippings.mjs --dry-run   (count + list IDs, delete nothing)
 *   SANITY_DATASET=production node scripts/deleteAllPressClippings.mjs
 */

import { createClient } from '@sanity/client'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID     = 'n2ynpgty'
const API_VERSION    = '2024-01-01'
const SANITY_TOKEN   = process.env.SANITY_TOKEN
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'staging'

const dryRun = process.argv.includes('--dry-run')

if (!SANITY_TOKEN) {
  console.error('❌  SANITY_TOKEN er ikke satt. Kreves også for --dry-run (drafts er ikke synlige uten auth).')
  process.exit(1)
}

if (SANITY_DATASET === 'production' && !dryRun) {
  console.warn('⚠️  Kjører DESTRUKTIV sletting mot PRODUCTION-datasettet.')
  console.warn('    Forutsetter fersk backup (npx sanity dataset export production ...).')
  console.warn('    Ctrl-C innen 8 sek for å avbryte.')
  await new Promise(r => setTimeout(r, 8000))
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: API_VERSION,
  token: SANITY_TOKEN,
  useCdn: false,
  // 'raw' guarantees drafts are included regardless of client-version defaults.
  perspective: 'raw',
})

// ── Delete ────────────────────────────────────────────────────────────────────

async function run() {
  // With perspective 'raw', this returns both published docs and their
  // "drafts."-prefixed counterparts.
  const ids = await client.fetch(`*[_type == "pressClipping"]._id`)
  const draftCount = ids.filter(id => id.startsWith('drafts.')).length
  console.log(
    `Fant ${ids.length} pressClipping-dokumenter i '${SANITY_DATASET}' ` +
    `(${ids.length - draftCount} publiserte, ${draftCount} drafts).`
  )

  if (ids.length === 0) {
    console.log('Ingenting å slette.')
    return
  }

  if (dryRun) {
    ids.forEach(id => console.log(`  [dry-run] ville slettet: ${id}`))
    console.log('Dry-run ferdig. Ingenting slettet.')
    return
  }

  const batchSize = 50
  let deleted = 0

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const tx = client.transaction()
    batch.forEach(id => tx.delete(id))
    await tx.commit()
    deleted += batch.length
    console.log(`  ✓ ${deleted}/${ids.length} slettet`)
  }

  console.log('Ferdig. Alle pressClipping-dokumenter er slettet.')

  // Verify
  const remaining = await client.fetch(`count(*[_type == "pressClipping"])`)
  console.log(`Verifisering: ${remaining} pressClipping-dokumenter gjenstår (skal være 0).`)
}

run().catch(err => {
  console.error('Sletting feilet:', err)
  process.exit(1)
})
