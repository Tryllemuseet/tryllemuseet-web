/**
 * migratePressClippingImages.mjs
 *
 * One-off migration script — moves pressClipping.image (single image field)
 * into pressClipping.images[] (array of 'faksimile' items). Uses patch per
 * document, never dataset import --replace. Preserves hotspot/crop/alt.
 *
 * isPublicDomain is deliberately left untouched (unset/false), so no
 * facsimile is shown on the site until an editor has verified the article's
 * rights status — rights gating must be an explicit editorial decision.
 *
 * Required env vars:
 *   SANITY_TOKEN    — Sanity API token (editor or write)
 *
 * Optional env vars:
 *   SANITY_DATASET  — Target dataset (default: staging — pass 'production' explicitly)
 *
 * Usage:
 *   node scripts/migratePressClippingImages.mjs --dry-run   (list docs, don't write)
 *   SANITY_DATASET=production node scripts/migratePressClippingImages.mjs
 */

import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID     = 'n2ynpgty'
const API_VERSION    = '2024-01-01'
const SANITY_TOKEN   = process.env.SANITY_TOKEN
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'staging'

const dryRun = process.argv.includes('--dry-run')

if (!SANITY_TOKEN && !dryRun) {
  console.error('❌  SANITY_TOKEN er ikke satt. Kjør med --dry-run for å teste uten skrivetilgang.')
  process.exit(1)
}

if (SANITY_DATASET === 'production' && !dryRun) {
  console.warn('⚠️  Kjører mot PRODUCTION-datasettet. Ctrl-C innen 5 sek for å avbryte.')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: API_VERSION,
  token: SANITY_TOKEN,
  useCdn: false,
})

// ── Migration ─────────────────────────────────────────────────────────────────

async function migrate() {
  // Includes drafts (no publishedAt/isVisible filter — this is a data
  // migration, not a content query). Skips docs already migrated.
  const docs = await client.fetch(
    `*[_type == "pressClipping" && defined(image) && !defined(images)]{ _id, image }`
  )

  console.log(`Fant ${docs.length} dokumenter med gammelt 'image'-felt (dataset: ${SANITY_DATASET}).`)

  let migrated = 0
  for (const doc of docs) {
    // Spread keeps asset, hotspot, crop and alt intact; only _type/_key change.
    const { _type: _oldType, ...imageProps } = doc.image
    const newImageItem = {
      ...imageProps,
      _key: randomUUID().slice(0, 12),
      _type: 'faksimile',
    }

    if (dryRun) {
      console.log(`  [dry-run] ${doc._id} →`, JSON.stringify(newImageItem))
      continue
    }

    await client
      .patch(doc._id)
      .setIfMissing({ images: [] })
      .set({ images: [newImageItem] })
      .unset(['image'])
      .commit()

    migrated++
    console.log(`  ✓ ${doc._id}`)
  }

  console.log(dryRun ? 'Dry-run ferdig. Ingenting skrevet.' : `Ferdig. ${migrated} dokumenter migrert.`)
}

migrate().catch(err => {
  console.error('Migrering feilet:', err)
  process.exit(1)
})
