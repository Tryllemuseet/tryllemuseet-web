/**
 * importNbArticle.mjs
 *
 * Fetches metadata from Nasjonalbiblioteket (api.nb.no) for a digitized
 * newspaper article and creates a draft pressClipping document in Sanity.
 *
 * The script auto-fills: sourceName, originalDate, sourceUrl, and uploads
 * the IIIF thumbnail as a Sanity image asset.
 * The editor must complete: title, teaser (and optionally commentary, someText).
 *
 * Required env vars:
 *   SANITY_TOKEN    — Sanity API token (editor or write)
 *
 * Optional env vars:
 *   SANITY_DATASET  — Target dataset (default: staging — pass 'production' explicitly)
 *
 * Usage:
 *   node scripts/importNbArticle.mjs https://www.nb.no/items/URN:NBN:no-nb_digavis_...
 *   SANITY_DATASET=production node scripts/importNbArticle.mjs <url>
 *   node scripts/importNbArticle.mjs <url> --dry-run   (print doc, don't write to Sanity)
 */

import { createClient } from '@sanity/client'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID    = 'n2ynpgty'
const API_VERSION   = '2024-01-01'
const SANITY_TOKEN  = process.env.SANITY_TOKEN
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'staging'

const NB_API_BASE   = 'https://api.nb.no/catalog/v1/items'
const IIIF_BASE     = 'https://www.nb.no/services/image/resolver'

// ── Guards ────────────────────────────────────────────────────────────────────

const inputUrl = process.argv[2]
const dryRun   = process.argv.includes('--dry-run')

if (!inputUrl || inputUrl.startsWith('--')) {
  console.error('Usage: node scripts/importNbArticle.mjs <nb.no URL> [--dry-run]')
  process.exit(1)
}

if (!SANITY_TOKEN && !dryRun) {
  console.error('❌  SANITY_TOKEN er ikke satt. Kjør med --dry-run for å teste uten skrivetilgang.')
  process.exit(1)
}

if (SANITY_DATASET === 'production') {
  console.warn('⚠️  Kjører mot PRODUCTION-datasettet. Ctrl-C innen 5 sek for å avbryte.')
  await new Promise(r => setTimeout(r, 5000))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extracts URN from a nb.no URL.
 * Handles:
 *   https://www.nb.no/items/URN:NBN:no-nb_digavis_aftenposten_null_null_19120101_1_1_1_00104
 *   https://www.nb.no/items/URN:NBN:no-nb_digavis_aftenposten_null_null_19120101_1_1_1_00104?page=1
 */
function extractUrn(url) {
  const match = url.match(/URN:[A-Z0-9:._-]+/i)
  if (!match) throw new Error(`Fant ingen URN i URL-en: ${url}`)
  return match[0]
}

/**
 * Extracts ISO date (YYYY-MM-DD) and newspaper slug from a digavis URN.
 * digavis URN format: URN:NBN:no-nb_digavis_{newspaper}_{x}_{x}_{YYYYMMDD}_{...}
 */
function parseDigavisUrn(urn) {
  const digavisMatch = urn.match(/digavis_([^_]+)_[^_]+_[^_]+_(\d{8})/)
  if (!digavisMatch) return { newspaper: null, date: null }

  const newspaper = digavisMatch[1]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const raw = digavisMatch[2]
  const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`

  return { newspaper, date }
}

/** Normalizes NB API fields that may be string | string[] */
function first(val) {
  if (!val) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

/** Constructs IIIF image URL for a given URN and width */
function iiifUrl(urn, width = 800) {
  return `${IIIF_BASE}/${encodeURIComponent(urn)}/full/${width},/0/native.jpg`
}

/** Fetches metadata for a URN from api.nb.no */
async function fetchNbMeta(urn) {
  const url = `${NB_API_BASE}/${encodeURIComponent(urn)}`
  console.log(`🔍 Henter metadata fra: ${url}`)

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Tryllemuseet-import/1.0' },
  })

  if (!res.ok) {
    throw new Error(`NB API svarte med ${res.status} ${res.statusText} for URN: ${urn}`)
  }

  return res.json()
}

/** Downloads an image and returns a Buffer */
async function fetchImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Klarte ikke laste ned bilde fra ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// ── Sanity client ─────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId:  PROJECT_ID,
  dataset:    SANITY_DATASET,
  apiVersion: API_VERSION,
  token:      SANITY_TOKEN,
  useCdn:     false,
})

// ── Main ──────────────────────────────────────────────────────────────────────

try {
  const urn = extractUrn(inputUrl)
  console.log(`\n📰 URN: ${urn}`)

  // Fetch metadata from NB API
  const item = await fetchNbMeta(urn)

  // Extract fields — handle both array and string shapes defensively
  const meta = item?.metadata ?? {}
  const apiTitle      = first(meta.title)
  const apiDate       = first(first(meta.originInfo)?.dateIssued ?? meta.dateIssued)
  const thumbnailHref = item?._links?.thumbnail_custom?.href ?? null

  // Fallback to URN-parsed values
  const { newspaper: urnNewspaper, date: urnDate } = parseDigavisUrn(urn)

  const sourceName   = apiTitle     ?? urnNewspaper ?? ''
  const originalDate = apiDate
    ? apiDate.split('T')[0]      // strip time component if present
    : urnDate ?? ''

  const thumbUrl = thumbnailHref ?? iiifUrl(urn, 800)

  console.log(`\n📋 Hentet:`)
  console.log(`   Avis:    ${sourceName || '(ikke funnet)'}`)
  console.log(`   Dato:    ${originalDate || '(ikke funnet)'}`)
  console.log(`   Bilde:   ${thumbUrl}`)
  console.log(`   Lenke:   ${inputUrl}`)

  // Build the Sanity document (editor must fill in title + teaser)
  const doc = {
    _type:        'pressClipping',
    isVisible:    false,   // hidden until editor has completed title + teaser
    title:        `[TITTEL MANGLER] — ${sourceName} ${originalDate}`,
    slug:         { _type: 'slug', current: `nb-${urn.slice(-16).toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
    publishedAt:  new Date().toISOString(),
    originalDate: originalDate || undefined,
    sourceName:   sourceName || undefined,
    sourceUrl:    inputUrl,
    teaser:       '[INGRESS MANGLER — fyll inn i Sanity Studio]',
  }

  if (dryRun) {
    console.log('\n🔎 Dry-run — dokument som ville blitt opprettet:')
    console.log(JSON.stringify(doc, null, 2))
    process.exit(0)
  }

  // Upload thumbnail image to Sanity
  console.log('\n⬆️  Laster opp bilde til Sanity...')
  let imageAsset = null
  try {
    const imgBuffer = await fetchImage(thumbUrl)
    imageAsset = await sanity.assets.upload('image', imgBuffer, {
      filename: `nb-${urn.slice(-20).replace(/[^a-z0-9]/gi, '-')}.jpg`,
      contentType: 'image/jpeg',
    })
    console.log(`   ✅ Bilde lastet opp: ${imageAsset._id}`)
    doc.images = [
      {
        _key: imageAsset._id.slice(-12),
        _type: 'faksimile',
        asset: { _type: 'reference', _ref: imageAsset._id },
        alt: `Faksimile fra ${sourceName || 'avis'}${originalDate ? `, ${originalDate}` : ''}`,
      },
    ]
  } catch (imgErr) {
    console.warn(`   ⚠️  Bilde-opplasting feilet: ${imgErr.message}`)
    console.warn(`   Legg til bilde manuelt i Studio (IIIF-URL: ${thumbUrl})`)
  }

  // Create draft document in Sanity
  console.log('\n💾 Oppretter Sanity-dokument...')
  const created = await sanity.create(doc)
  const studioUrl = `https://tryllemuseet.sanity.studio/structure/pressClipping;${created._id}`

  console.log(`\n✅ Ferdig!`)
  console.log(`   Dokument-ID: ${created._id}`)
  console.log(`   Åpne i Studio og fyll inn tittel og ingress:`)
  console.log(`   ${studioUrl}`)
  console.log(`\n⚠️  Husk: sett isVisible = true og publiser når artikkelen er ferdig.`)

} catch (err) {
  console.error(`\n❌ Feil: ${err.message}`)
  process.exit(1)
}
