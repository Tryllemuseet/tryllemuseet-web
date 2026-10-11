#!/usr/bin/env node
/**
 * move-closed-content-to-private-dataset.mjs
 *
 * Moves the Bak teppet content (kitCollection + kitTrick documents, drafts
 * included, and every image/file asset they reference) from one dataset to
 * another — in practice from the public "production" dataset to the private
 * "lukket" dataset, where neither documents nor assets can be listed without a
 * token. See docs/kit-trick-operations-routine.md.
 *
 * Two separate steps, so the web and Studio can be switched over in between:
 *
 *   1. Copy (default). Idempotent: re-running replaces the target documents
 *      with the source's current versions. Assets are re-uploaded to the
 *      target; Sanity derives asset IDs from the file contents, so references
 *      stay valid (the script remaps them if an ID ever differs).
 *
 *        SOURCE_DATASET=production TARGET_DATASET=lukket \
 *          node scripts/move-closed-content-to-private-dataset.mjs [--dry-run]
 *
 *   2. Delete from source (--delete-source). Only after the site and Studio
 *      read from the target. Refuses unless every source document exists in
 *      the target with identical content (so no edit made since the copy is
 *      lost), then deletes the documents and any asset no longer referenced
 *      in the source.
 *
 *        SOURCE_DATASET=production TARGET_DATASET=lukket \
 *          node scripts/move-closed-content-to-private-dataset.mjs --delete-source [--dry-run]
 *
 * Token: SANITY_API_TOKEN / SANITY_TOKEN / SANITY_AUTH_TOKEN (needs write
 * access to both datasets).
 */

import { createClient } from '@sanity/client'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const deleteSource = args.includes('--delete-source')
const source = process.env.SOURCE_DATASET
const target = process.env.TARGET_DATASET
const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!source || !target || source === target) {
  console.error('Set SOURCE_DATASET and TARGET_DATASET (different datasets).')
  process.exit(1)
}
if (target === 'production') {
  console.error('Refusing to move closed content INTO the public "production" dataset.')
  process.exit(1)
}
if (!token) {
  console.error('No Sanity token (SANITY_API_TOKEN / SANITY_TOKEN / SANITY_AUTH_TOKEN).')
  process.exit(1)
}

const client = dataset =>
  createClient({ projectId: 'n2ynpgty', dataset, apiVersion: '2024-01-01', useCdn: false, token, perspective: 'raw' })
const src = client(source)
const dst = client(target)

const TYPES = ['kitCollection', 'kitTrick']
// With the raw perspective this includes drafts (they share the _type).
const DOC_QUERY = `*[_type in $types] | order(_id asc)`

// Every asset reference (`_ref` of an image or file asset) in a document.
function assetRefs(value, out = new Set()) {
  if (Array.isArray(value)) value.forEach(v => assetRefs(v, out))
  else if (value && typeof value === 'object') {
    if (typeof value._ref === 'string' && /^(image|file)-/.test(value._ref)) out.add(value._ref)
    Object.values(value).forEach(v => assetRefs(v, out))
  }
  return out
}

function remapRefs(value, map) {
  if (Array.isArray(value)) return value.map(v => remapRefs(v, map))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = k === '_ref' && map.has(v) ? map.get(v) : remapRefs(v, map)
    return out
  }
  return value
}

// Document content without system fields, for comparing source and target.
const SYSTEM_FIELDS = new Set(['_rev', '_createdAt', '_updatedAt'])
const content = doc => JSON.stringify(doc, (k, v) => (SYSTEM_FIELDS.has(k) ? undefined : v))

async function copy() {
  const docs = await src.fetch(DOC_QUERY, { types: TYPES })
  const refs = new Set()
  docs.forEach(d => assetRefs(d, refs))
  console.log(`${source} → ${target}${dryRun ? ' (dry run)' : ''}: ${docs.length} documents, ${refs.size} assets`)

  const map = new Map()
  for (const ref of refs) {
    const asset = await src.getDocument(ref)
    if (!asset?.url) throw new Error(`Asset ${ref} not found in ${source}`)
    if (await dst.getDocument(ref)) continue // already copied
    if (dryRun) { console.log(`  [dry-run] would copy asset ${ref}`); continue }
    const res = await fetch(asset.url)
    if (!res.ok) throw new Error(`Download failed for ${ref}: HTTP ${res.status}`)
    const uploaded = await dst.assets.upload(
      ref.startsWith('image-') ? 'image' : 'file',
      Buffer.from(await res.arrayBuffer()),
      { filename: asset.originalFilename, contentType: asset.mimeType },
    )
    if (uploaded._id !== ref) map.set(ref, uploaded._id)
    console.log(`  asset ${ref}${uploaded._id !== ref ? ` → ${uploaded._id}` : ''}`)
  }

  const tx = dst.transaction()
  for (const doc of docs) {
    const { _rev, _createdAt, _updatedAt, ...rest } = doc
    tx.createOrReplace(remapRefs(rest, map))
  }
  if (dryRun) {
    docs.forEach(d => console.log(`  [dry-run] would write ${d._id} (${d._type}${d.title ? `, «${d.title}»` : ''})`))
    return
  }
  await tx.commit()
  console.log(`  ✓ wrote ${docs.length} documents to ${target}`)

  // Every reference in the target resolves.
  const dangling = await dst.fetch(
    `*[_type in $types]{ _id, "missing": array::compact(tricks[!defined(@->_id)]._ref) + array::compact(relatedTricks[!defined(@->_id)]._ref) }[count(missing) > 0]`,
    { types: TYPES },
  )
  if (dangling.length) throw new Error(`Dangling references in ${target}: ${JSON.stringify(dangling)}`)
  console.log('  ✓ all references resolve')
}

async function removeFromSource() {
  const docs = await src.fetch(DOC_QUERY, { types: TYPES })
  console.log(`Delete from ${source}${dryRun ? ' (dry run)' : ''}: ${docs.length} documents`)

  // Same content in the target, or stop: something was edited after the copy.
  for (const doc of docs) {
    const copy = await dst.getDocument(doc._id)
    if (!copy) throw new Error(`${doc._id} is missing in ${target} — run the copy step first.`)
    if (content(copy) !== content(doc)) throw new Error(`${doc._id} differs between ${source} and ${target} — re-run the copy step first.`)
  }
  console.log(`  ✓ all ${docs.length} documents are identical in ${target}`)

  const refs = new Set()
  docs.forEach(d => assetRefs(d, refs))
  if (dryRun) {
    docs.forEach(d => console.log(`  [dry-run] would delete ${d._id}`))
    console.log(`  [dry-run] would then delete up to ${refs.size} assets no longer referenced in ${source}`)
    return
  }

  const tx = src.transaction()
  docs.forEach(d => tx.delete(d._id))
  await tx.commit()
  console.log(`  ✓ deleted ${docs.length} documents`)

  let deleted = 0
  for (const ref of refs) {
    if (await src.fetch('count(*[references($ref)])', { ref })) {
      console.log(`  = kept ${ref} (still used elsewhere in ${source})`)
      continue
    }
    await src.delete(ref)
    deleted++
  }
  console.log(`  ✓ deleted ${deleted} assets`)
}

await (deleteSource ? removeFromSource() : copy())
