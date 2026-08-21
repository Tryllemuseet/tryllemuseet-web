/**
 * check-qr-codes.mjs
 *
 * Pre-launch QR sanity check (see docs/tryllemuseet_lanseringsforbedringer_ai.md
 * section 10). The physical QR stickers in the museum print a stable
 * "/qr/{nummer}" URL that resolves at *build time* to whatever page the
 * matching `qrCode` document currently points to (see
 * web/src/pages/qr/[number].astro + getQrRedirects() in
 * web/src/lib/sanity.ts). getQrRedirects() silently drops any qrCode whose
 * target is unresolvable — which means that QR number simply never gets a
 * static page built, and scanning the physical sticker 404s. This script
 * finds those cases *before* that happens.
 *
 * For every qrCode document, checks:
 *   - duplicate qrNumber (should be prevented by schema validation, but
 *     re-verified here in case of a stale/unpublished conflict)
 *   - customPath set but doesn't start with "/" (schema should prevent this
 *     too, but re-checked)
 *   - target reference set but the referenced `legend` doc is missing
 *   - target `legend` has no slug
 *   - target `legend` is hidden (isVisible == false) — the QR would resolve
 *     to a page that doesn't get built
 *   - neither customPath nor target set at all
 *
 * With --live, also does a live HTTP check (GET, 301 → 200) against each
 * resolvable qrNumber's public /qr/{n} URL and its final destination, against
 * https://tryllemuseet.no by default (override with --base-url=<url> to
 * check test.tryllemuseet.no or a Vercel preview instead).
 *
 * Read-only — never writes to Sanity.
 *
 * Usage:
 *   node scripts/check-qr-codes.mjs [--live] [--base-url=https://tryllemuseet.no]
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN, the local
 *    Sanity CLI login, or none at all — published qrCode docs are public)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const args = process.argv.slice(2)
const live = args.includes('--live')
const baseUrlArg = args.find(a => a.startsWith('--base-url='))
const baseUrl = (baseUrlArg ? baseUrlArg.split('=')[1] : 'https://tryllemuseet.no').replace(/\/$/, '')
const dataset = process.env.SANITY_DATASET ?? 'production'

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    return JSON.parse(readFileSync(configPath, 'utf-8'))?.authToken ?? null
  } catch {
    return null
  }
}

const token =
  process.env.SANITY_API_TOKEN ??
  process.env.SANITY_TOKEN ??
  process.env.SANITY_AUTH_TOKEN ??
  getStoredToken() ??
  undefined

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const rows = await client.fetch(`
  *[_type == "qrCode" && defined(qrNumber)] | order(qrNumber asc) {
    qrNumber,
    customPath,
    "hasTargetRef": defined(target._ref),
    "targetExists": defined(target->_id),
    "targetTitle": target->title,
    "targetSlug": target->slug.current,
    "targetVisible": target->isVisible != false,
    "targetIsUtstilling": defined(target->physicalOrder) || count(target->stations) > 0
  }
`)

const problems = []
const ok = []
const seenNumbers = new Map()

for (const r of rows) {
  const label = `QR #${r.qrNumber}`
  const dupe = seenNumbers.get(r.qrNumber)
  if (dupe) problems.push(`${label}: duplikat qrNumber (deles med et annet dokument)`)
  seenNumbers.set(r.qrNumber, true)

  if (r.customPath) {
    if (!r.customPath.startsWith('/')) {
      problems.push(`${label}: customPath "${r.customPath}" starter ikke med "/"`)
      continue
    }
    ok.push({ qrNumber: r.qrNumber, path: r.customPath, source: 'customPath' })
    continue
  }

  if (!r.hasTargetRef) {
    problems.push(`${label}: mangler både customPath og target — QR-koden peker ingen steder`)
    continue
  }
  if (!r.targetExists) {
    problems.push(`${label}: target-referansen peker til et dokument som ikke lenger finnes`)
    continue
  }
  if (!r.targetSlug) {
    problems.push(`${label}: target "${r.targetTitle ?? '(uten tittel)'}" mangler slug`)
    continue
  }
  if (!r.targetVisible) {
    problems.push(`${label}: target "${r.targetTitle}" er skjult (isVisible: false) — siden bygges ikke, QR-koden vil 404`)
    continue
  }
  const path = r.targetIsUtstilling
    ? `/utstillingen/${r.targetSlug}`
    : `/tryllehistorie/fordypninger/${r.targetSlug}`
  ok.push({ qrNumber: r.qrNumber, path, source: r.targetTitle })
}

console.log(`\nFant ${rows.length} QR-kode-dokumenter i dataset "${dataset}".\n`)

if (problems.length > 0) {
  console.log(`❌ ${problems.length} problem(er) funnet — disse QR-numrene vil IKKE fungere:\n`)
  problems.forEach(p => console.log(`   ${p}`))
  console.log('')
} else {
  console.log('✅ Ingen strukturelle problemer funnet — alle QR-koder peker til noe som burde bygges.\n')
}

console.log(`${ok.length} QR-kode(r) resolver til en side:`)
ok.forEach(o => console.log(`   #${o.qrNumber} → ${o.path}  (${o.source})`))

if (!live) {
  console.log('\nKjør med --live for også å HTTP-sjekke /qr/{nummer} og målsiden mot en faktisk nettside (default https://tryllemuseet.no).')
  process.exit(problems.length > 0 ? 1 : 0)
}

console.log(`\n🌐 Live-sjekk mot ${baseUrl} ...\n`)
let liveFailures = 0

for (const o of ok) {
  const qrUrl = `${baseUrl}/qr/${o.qrNumber}`
  try {
    const res = await fetch(qrUrl, { redirect: 'follow' })
    const finalUrl = res.url
    if (res.ok) {
      console.log(`   ✅ #${o.qrNumber}  ${qrUrl} → ${res.status} (${finalUrl})`)
    } else {
      liveFailures++
      console.log(`   ❌ #${o.qrNumber}  ${qrUrl} → HTTP ${res.status} (${finalUrl})`)
    }
  } catch (err) {
    liveFailures++
    console.log(`   ❌ #${o.qrNumber}  ${qrUrl} → feil: ${err.message}`)
  }
}

if (liveFailures > 0) {
  console.log(`\n❌ ${liveFailures} QR-kode(r) feilet live-sjekken.`)
}

process.exit(problems.length > 0 || liveFailures > 0 ? 1 : 0)
