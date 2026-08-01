/**
 * remove-norske-legender-tag.mjs
 *
 * Strips the leftover 'norske-legender' tag value from legend.tags[]. The
 * tag predates the 2026-07 rename of the section from "Norske legender" to
 * "Fordypninger" (which now covers both Norwegian and international
 * articles) and had already stopped doing anything on the website — it was
 * only special-cased out of the visible tag-filter UI. This removes the
 * stale value from content instead of special-casing it in code.
 *
 * Only removes the one string from each doc's tags array; other tags on
 * the same doc are left untouched.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/remove-norske-legender-tag.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/remove-norske-legender-tag.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (fjerner "norske-legender" fra legend.tags). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const TAG = 'norske-legender'

const docs = await client.fetch(`*[_type == "legend" && $tag in tags]{ _id, title, tags }`, { tag: TAG })

console.log(`Fant ${docs.length} legend-dokument(er) med taggen "${TAG}":`)
for (const doc of docs) {
  const remaining = doc.tags.filter(t => t !== TAG)
  console.log(`  - ${doc._id} (${doc.title}): ${JSON.stringify(doc.tags)} → ${JSON.stringify(remaining)}`)
}

if (dryRun) {
  console.log('\n--dry-run: ingen endringer skrevet.')
  process.exit(0)
}

if (docs.length === 0) {
  console.log('\nIngenting å gjøre.')
  process.exit(0)
}

const tx = client.transaction()
for (const doc of docs) {
  const remaining = doc.tags.filter(t => t !== TAG)
  tx.patch(doc._id, p => (remaining.length > 0 ? p.set({ tags: remaining }) : p.unset(['tags'])))
}
await tx.commit()

console.log(`\n✅ Oppdaterte ${docs.length} dokument(er).`)
