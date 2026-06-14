/**
 * importHoudiniPressklipp.mjs
 *
 * Transforms and imports the Houdini press clipping NDJSON into Sanity.
 *
 * The NDJSON uses "source" but the schema field is "sourceName" — this script
 * maps it correctly. It also links every clipping to the specialExhibition
 * document via exhibitionRef.
 *
 * Required env vars:
 *   SANITY_TOKEN       — Sanity API token (editor or write access)
 *
 * Optional env vars:
 *   SANITY_DATASET     — Target dataset (default: staging — pass 'production' explicitly)
 *
 * Usage:
 *   node scripts/importHoudiniPressklipp.mjs <ndjson-file> <exhibition-id>
 *   node scripts/importHoudiniPressklipp.mjs <ndjson-file> <exhibition-id> --dry-run
 *   SANITY_DATASET=production node scripts/importHoudiniPressklipp.mjs <ndjson-file> <exhibition-id>
 *
 * Example:
 *   SANITY_TOKEN=sk... node scripts/importHoudiniPressklipp.mjs \
 *     ~/Downloads/pressclippings_houdini.ndjson \
 *     specialExhibition-abc123 \
 *     --dry-run
 */

import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID     = 'n2ynpgty'
const API_VERSION    = '2024-01-01'
const SANITY_TOKEN   = process.env.SANITY_TOKEN
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'staging'

// ── Args ──────────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2)
const ndjsonPath = args.find(a => !a.startsWith('--') && !a.includes('specialExhibition') && !a.startsWith('draft'))
const exhibitionId = args.find(a => a.startsWith('specialExhibition') || a.startsWith('drafts.specialExhibition'))
const dryRun    = args.includes('--dry-run')

if (!ndjsonPath || !exhibitionId) {
  console.error('Usage: node scripts/importHoudiniPressklipp.mjs <ndjson-file> <exhibition-id> [--dry-run]')
  console.error('Example exhibition-id: specialExhibition-abc123def456')
  console.error('Find the id in Sanity Studio → Spesialutstilling → open document → copy _id from URL or API')
  process.exit(1)
}

if (!dryRun && !SANITY_TOKEN) {
  console.error('Error: SANITY_TOKEN env var required. Set it or use --dry-run.')
  process.exit(1)
}

const client = dryRun ? null : createClient({
  projectId:  PROJECT_ID,
  dataset:    SANITY_DATASET,
  apiVersion: API_VERSION,
  token:      SANITY_TOKEN,
  useCdn:     false,
})

// ── Transform ─────────────────────────────────────────────────────────────────

/**
 * Maps a raw NDJSON document to a valid pressClipping document.
 * Key mapping: source → sourceName
 */
function transform(raw) {
  const doc = {
    _type:      'pressClipping',
    _id:        raw._id,
    isVisible:  raw.isVisible ?? true,

    // Core fields
    title:       raw.title ?? '(uten tittel)',
    slug:        raw.slug,
    publishedAt: raw.publishedAt,
    originalDate: raw.originalDate,

    // "source" in NDJSON → "sourceName" in schema
    sourceName:  raw.sourceName ?? raw.source,
    sourceUrl:   raw.sourceUrl,

    // Content
    teaser:       raw.teaser,
    commentary:   raw.commentary,
    someText:     raw.someText,
    instagramText: raw.instagramText,
    tiktokText:   raw.tiktokText,
    category:     raw.category,

    // Link to the Houdini special exhibition
    exhibitionRef: {
      _type: 'reference',
      _ref:  exhibitionId,
    },
  }

  // Remove undefined fields — Sanity rejects them
  return Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined))
}

// ── Read NDJSON ───────────────────────────────────────────────────────────────

async function readNdjson(filePath) {
  const docs = []
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity })
  for await (const line of rl) {
    const trimmed = line.trim()
    if (trimmed) docs.push(JSON.parse(trimmed))
  }
  return docs
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Dataset:      ${SANITY_DATASET}`)
  console.log(`Exhibition:   ${exhibitionId}`)
  console.log(`File:         ${ndjsonPath}`)
  console.log(`Mode:         ${dryRun ? 'DRY RUN (no writes)' : 'LIVE'}`)
  console.log()

  const rawDocs = await readNdjson(ndjsonPath)
  console.log(`Read ${rawDocs.length} documents from NDJSON`)

  const transformed = rawDocs.map(transform)

  if (dryRun) {
    console.log('\n── First document (dry run preview) ─────────────────────')
    console.log(JSON.stringify(transformed[0], null, 2))
    console.log(`\n── Would import ${transformed.length} documents ──`)
    console.log('Run without --dry-run to write to Sanity.')
    return
  }

  // Import in batches of 20 using createOrReplace
  const BATCH = 20
  let imported = 0
  let failed   = 0

  for (let i = 0; i < transformed.length; i += BATCH) {
    const batch = transformed.slice(i, i + BATCH)
    try {
      const tx = client.transaction()
      batch.forEach(doc => tx.createOrReplace(doc))
      await tx.commit()
      imported += batch.length
      process.stdout.write(`\rImported ${imported}/${transformed.length}...`)
    } catch (err) {
      failed += batch.length
      console.error(`\nBatch ${i}–${i + BATCH} failed:`, err.message)
    }
  }

  console.log(`\n\nDone. ${imported} imported, ${failed} failed.`)

  if (imported > 0) {
    console.log(`\nVerify in Studio: https://tryllemuseet.sanity.studio/`)
    console.log(`Or via GROQ: *[_type == "pressClipping" && exhibitionRef._ref == "${exhibitionId}"] | order(originalDate asc) { title, originalDate }`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
