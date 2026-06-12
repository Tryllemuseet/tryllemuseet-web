/**
 * searchNb.mjs
 *
 * Searches Nasjonalbiblioteket (api.nb.no) for digitized newspaper articles
 * and saves results as a markdown file — one entry per article.
 *
 * Usage:
 *   node scripts/searchNb.mjs "tryllekunstner"
 *   node scripts/searchNb.mjs "Norsk Tryllekunstnerring" --size 100
 *   node scripts/searchNb.mjs "tryllekunst" --from 1900 --to 1960
 *   node scripts/searchNb.mjs "Robert Dahl" --newspaper aftenposten
 *
 * Output:
 *   nb-search-results/<query>-<date>.md
 *
 * The .md file can be opened in any editor, reviewed, and used as input
 * for importNbArticle.mjs (one article at a time) or batch import later.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// ── Args ──────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2)
const query   = args.find(a => !a.startsWith('--'))

if (!query) {
  console.error('Usage: node scripts/searchNb.mjs "<søkeord>" [--size N] [--from YYYY] [--to YYYY] [--newspaper <slug>]')
  console.error('')
  console.error('Eksempler:')
  console.error('  node scripts/searchNb.mjs "tryllekunstner"')
  console.error('  node scripts/searchNb.mjs "Norsk Tryllekunstnerring" --size 100')
  console.error('  node scripts/searchNb.mjs "tryllekunst" --from 1900 --to 1960')
  console.error('  node scripts/searchNb.mjs "trylleri" --newspaper aftenposten')
  process.exit(1)
}

function getArg(flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : null
}

const size       = parseInt(getArg('--size') ?? '50', 10)
const fromYear   = getArg('--from')
const toYear     = getArg('--to')
const newspaper  = getArg('--newspaper')

// ── Helpers ───────────────────────────────────────────────────────────────────

function first(val) {
  if (val == null) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

function parseDigavisUrn(urn) {
  const m = urn?.match(/digavis_([^_]+)_[^_]+_[^_]+_(\d{8})/)
  if (!m) return { newspaper: null, date: null }
  const name = m[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const raw  = m[2]
  return { newspaper: name, date: `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}` }
}

function iiifUrl(urn, width = 600) {
  return `https://www.nb.no/services/image/resolver/${encodeURIComponent(urn)}/full/${width},/0/native.jpg`
}

function nbUrl(urn) {
  return `https://www.nb.no/items/${encodeURIComponent(urn)}`
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Build query URL ───────────────────────────────────────────────────────────

const params = new URLSearchParams({
  q:                    query,
  mediatype:            'aviser',
  digitalAccessibleOnly: 'true',
  size:                 String(size),
})

if (fromYear && toYear) {
  // NB API date range filter: contentClasses field or date filter
  params.set('q', `${query} AND year:[${fromYear} TO ${toYear}]`)
}
if (newspaper) {
  params.set('q', params.get('q') + ` AND title:${newspaper}`)
}

const apiUrl = `https://api.nb.no/catalog/v1/items?${params}`

// ── Fetch ─────────────────────────────────────────────────────────────────────

console.log(`🔍 Søker: ${query}`)
console.log(`   URL: ${apiUrl}`)
console.log()

let data
try {
  const res = await fetch(apiUrl, {
    headers: { Accept: 'application/json', 'User-Agent': 'Tryllemuseet-search/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  data = await res.json()
} catch (err) {
  console.error(`❌ Klarte ikke koble til NB API: ${err.message}`)
  process.exit(1)
}

// NB API wraps results in _embedded.items
const items = data?._embedded?.items ?? data?.items ?? []
const total = data?.page?.totalElements ?? items.length

console.log(`✅ Fant ${total} treff — henter ${items.length} resultater\n`)

if (items.length === 0) {
  console.log('Ingen treff. Prøv et annet søkeord.')
  process.exit(0)
}

// ── Build markdown ────────────────────────────────────────────────────────────

const today    = new Date().toISOString().split('T')[0]
const filename = `${slugify(query)}-${today}.md`
const outDir   = 'nb-search-results'

mkdirSync(outDir, { recursive: true })

const lines = [
  `# NB-søk: «${query}»`,
  ``,
  `**Søkt:** ${new Date().toLocaleString('nb-NO')}  `,
  `**Treff totalt:** ${total}  `,
  `**Viser:** ${items.length}  `,
  `**API-URL:** ${apiUrl}`,
  ``,
  `---`,
  ``,
]

let exported = 0

for (const item of items) {
  const id  = item.id ?? item.metadata?.identifiers?.find(i => i.type === 'URN')?.value ?? ''
  const meta = item.metadata ?? {}

  // Title — may be array or string
  const apiTitle = first(meta.title) ?? first(meta.titleFull)

  // Date — try multiple field paths
  const originInfo = first(meta.originInfo)
  const apiDate    = first(originInfo?.dateIssued ?? originInfo?.dateCreated ?? meta.date)

  // Fallback: parse from URN
  const { newspaper: urnPaper, date: urnDate } = parseDigavisUrn(id)

  const sourceName   = apiTitle   ?? urnPaper ?? '(ukjent avis)'
  const originalDate = apiDate    ? apiDate.split('T')[0] : (urnDate ?? '')
  const thumbUrl     = item?._links?.thumbnail_custom?.href ?? (id ? iiifUrl(id) : '')
  const articleUrl   = id ? nbUrl(id) : ''

  // Access info
  const accessible = item?.accessInfo?.isDigitallyAccessible ?? true
  const accessFrom = item?.accessInfo?.accessAllowedFrom ?? 'EVERYWHERE'

  lines.push(`## ${sourceName}${originalDate ? ` — ${originalDate}` : ''}`)
  lines.push(``)
  if (originalDate) lines.push(`**Dato:** ${originalDate}  `)
  lines.push(`**Avis:** ${sourceName}  `)
  if (articleUrl)   lines.push(`**Lenke:** ${articleUrl}  `)
  if (thumbUrl)     lines.push(`**Bilde (IIIF):** ${thumbUrl}  `)
  if (id)           lines.push(`**URN:** \`${id}\`  `)
  lines.push(`**Tilgang:** ${accessible ? `✅ Digital tilgang (${accessFrom})` : '🔒 Begrenset tilgang'}  `)
  lines.push(``)
  lines.push(`> _Tittel / ingress:_`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  exported++
}

const outPath = join(outDir, filename)
writeFileSync(outPath, lines.join('\n'), 'utf-8')

console.log(`📄 Lagret ${exported} treff til: ${outPath}`)
console.log(``)
console.log(`Neste steg:`)
console.log(`  1. Åpne filen og se gjennom treffene`)
console.log(`  2. Bruk importNbArticle.mjs for å importere enkeltartikler:`)
console.log(`     node scripts/importNbArticle.mjs <nb.no-lenke>`)
