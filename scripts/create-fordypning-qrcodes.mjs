/**
 * create-fordypning-qrcodes.mjs
 *
 * Creates qrCode documents (schemaTypes/qrCode.ts) for:
 *  - every legend doc currently shown under /tryllehistorie/fordypninger
 *    (i.e. NOT_UTSTILLING: no physicalOrder, no stations) — one per article
 *  - the /tryllehistorie landing page itself, via the customPath field
 *
 * Numbers continue sequentially after the highest qrNumber already in use.
 * Idempotent: skips any legend doc that already has a qrCode pointing at it,
 * and skips the /tryllehistorie entry if a qrCode with that customPath
 * already exists.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/create-fordypning-qrcodes.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/create-fordypning-qrcodes.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter nye qrCode-dokumenter). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const NOT_UTSTILLING = `!defined(physicalOrder) && (!defined(stations) || count(stations) == 0)`
const TRYLLEHISTORIE_PATH = '/tryllehistorie'

const [fordypninger, existingTargetIds, existingMaxNumber, tryllehistorieExists] = await Promise.all([
  client.fetch(`*[_type == "legend" && isVisible != false && ${NOT_UTSTILLING}]{_id, title, "slug": slug.current} | order(title asc)`),
  client.fetch(`*[_type == "qrCode" && defined(target._ref)].target._ref`),
  client.fetch(`math::max(*[_type == "qrCode" && defined(qrNumber)].qrNumber)`),
  client.fetch(`count(*[_type == "qrCode" && customPath == $path]) > 0`, { path: TRYLLEHISTORIE_PATH }),
])

const targetSet = new Set(existingTargetIds)
const toCreate = fordypninger.filter(d => !targetSet.has(d._id))

let nextNumber = (existingMaxNumber ?? 0) + 1
const plan = toCreate.map(d => ({
  _id: `qrCode-${nextNumber}`,
  qrNumber: nextNumber++,
  kind: 'target',
  target: d,
}))

if (!tryllehistorieExists) {
  plan.push({
    _id: `qrCode-${nextNumber}`,
    qrNumber: nextNumber++,
    kind: 'customPath',
    customPath: TRYLLEHISTORIE_PATH,
  })
} else {
  console.log(`(Hopper over ${TRYLLEHISTORIE_PATH} — en qrCode med den customPath finnes allerede.)`)
}

console.log(`Planlegger ${plan.length} nye qrCode-dokument(er):`)
for (const p of plan) {
  console.log(
    p.kind === 'target'
      ? `  - #${p.qrNumber}: ${p._id} → ${p.target.title} (${p.target.slug})`
      : `  - #${p.qrNumber}: ${p._id} → ${p.customPath} (fast side-URL)`
  )
}

if (dryRun) {
  console.log('\n--dry-run: ingen endringer skrevet.')
  process.exit(0)
}

if (plan.length === 0) {
  console.log('\nIngenting å gjøre.')
  process.exit(0)
}

const tx = client.transaction()
for (const p of plan) {
  tx.createIfNotExists(
    p.kind === 'target'
      ? { _id: p._id, _type: 'qrCode', qrNumber: p.qrNumber, target: { _type: 'reference', _ref: p.target._id } }
      : { _id: p._id, _type: 'qrCode', qrNumber: p.qrNumber, customPath: p.customPath }
  )
}
await tx.commit()

console.log(`\n✅ Opprettet ${plan.length} qrCode-dokument(er).`)
