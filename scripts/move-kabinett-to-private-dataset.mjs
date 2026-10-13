#!/usr/bin/env node
/**
 * move-kabinett-to-private-dataset.mjs
 *
 * Moves the rooms of "Det trettende kabinett" (gameChapter) out of the public
 * "production" dataset into the private "lukket" dataset, together with the
 * answers, hints, replies and explanations that used to be in the game code
 * (2026-10; see web/src/lib/kabinett.ts). The gameConfig singleton stays in
 * production: it holds nothing secret, and every page reads it for the menu.
 *
 * The answers are NOT in this repository (it is public). They come from a
 * content file given with --content: JSON of the form
 *   { "rooms": { "<key>": { title, titleEn, intro, introEn, facts, answer,
 *                           hints, responses, solution, solutionEn } } }
 * built once from the game code as it was before the move (commit a06953a)
 * and kept outside git. After the move, Sanity is the only source.
 *
 * Two steps, like move-closed-content-to-private-dataset.mjs:
 *
 *   1. Copy (default). Writes one "lukket.game-room-<key>" document per room
 *      to TARGET_DATASET (createOrReplace, so re-runs are safe). Refuses if a
 *      source document has been edited away from the content file (title,
 *      intro or fact texts differ), or has images/rich text this script
 *      doesn't copy.
 *
 *        SOURCE_DATASET=production TARGET_DATASET=lukket \
 *          node scripts/move-kabinett-to-private-dataset.mjs --content=<file> [--dry-run]
 *
 *   2. Delete from source (--delete-source). Only once the site and Studio
 *      read from the target. Refuses unless every source room has a document
 *      in the target, then deletes the gameChapter documents (drafts too)
 *      from the source.
 *
 *        SOURCE_DATASET=production TARGET_DATASET=lukket \
 *          node scripts/move-kabinett-to-private-dataset.mjs --delete-source [--dry-run]
 *
 * Rehearse with TARGET_DATASET=development first.
 *
 * Token: SANITY_API_TOKEN / SANITY_TOKEN / SANITY_AUTH_TOKEN (read access to
 * the source; write access to the target, and to the source for step 2).
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const deleteSource = args.includes('--delete-source')
const contentPath = args.find(a => a.startsWith('--content='))?.slice('--content='.length)
const source = process.env.SOURCE_DATASET
const target = process.env.TARGET_DATASET
const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!source || !target || source === target) {
  console.error('Set SOURCE_DATASET and TARGET_DATASET (different datasets).')
  process.exit(1)
}
if (target === 'production') {
  console.error('Refusing to write the answers INTO the public "production" dataset.')
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

const targetId = key => `lukket.game-room-${key}`

// Public gameChapter documents in the source (raw perspective: drafts too).
const sourceDocs = await src.fetch(`*[_type == "gameChapter" && !(_id in path("lukket.**"))] | order(_id asc)`)

if (deleteSource) {
  const keys = [...new Set(sourceDocs.map(d => d.key).filter(Boolean))]
  const inTarget = new Set(await dst.fetch(`*[_type == "gameChapter" && _id in $ids]._id`, { ids: keys.map(targetId) }))
  const missing = keys.filter(k => !inTarget.has(targetId(k)))
  if (missing.length || sourceDocs.some(d => !d.key)) {
    console.error(`Refusing to delete: not in ${target}: ${missing.join(', ') || '(documents without a room key)'}`)
    process.exit(1)
  }
  console.log(`${dryRun ? '[dry run] would delete' : 'Deleting'} ${sourceDocs.length} gameChapter documents from ${source}:`)
  for (const d of sourceDocs) console.log(`  ${d._id}`)
  if (!dryRun) {
    const tx = src.transaction()
    for (const d of sourceDocs) tx.delete(d._id)
    await tx.commit()
    console.log('Done.')
  }
  process.exit(0)
}

if (!contentPath) {
  console.error('Pass --content=<file> (the content file with the answers, kept outside git).')
  process.exit(1)
}
const content = JSON.parse(readFileSync(contentPath, 'utf8')).rooms
if (!content || typeof content !== 'object') {
  console.error('The content file has no "rooms" object.')
  process.exit(1)
}

// Guard against losing edits made in Studio since the content file was built.
const problems = []
const published = sourceDocs.filter(d => !d._id.startsWith('drafts.'))
for (const d of sourceDocs.filter(d => d._id.startsWith('drafts.'))) problems.push(`${d._id}: unpublished draft — publish or discard it first`)
const norm = s => (s ?? '').trim()
for (const d of published) {
  const c = content[d.key]
  if (!c) { problems.push(`${d._id}: room "${d.key}" is not in the content file`); continue }
  if (d.image || d.introRich?.length || d.introRichEn?.length || d.facts?.some(f => f.image)) {
    problems.push(`${d._id}: has images or rich text, which this script doesn't copy`)
  }
  for (const f of ['title', 'titleEn', 'intro', 'introEn']) {
    if (d[f] && norm(d[f]) !== norm(c[f])) problems.push(`${d._id}: ${f} differs from the content file`)
  }
  const srcFacts = (d.facts ?? []).map(f => norm(f.text))
  const cFacts = (c.facts ?? []).map(f => norm(f.text))
  if (srcFacts.length && srcFacts.join('\n') !== cFacts.join('\n')) problems.push(`${d._id}: facts differ from the content file`)
  if (d.isVisible === false && c.isVisible !== false) problems.push(`${d._id}: hidden in ${source} but not in the content file`)
}
if (problems.length) {
  console.error('Refusing to copy:\n  ' + problems.join('\n  '))
  process.exit(1)
}

const FIELDS = ['isVisible', 'key', 'title', 'titleEn', 'intro', 'introEn', 'facts', 'answer', 'hints', 'responses', 'solution', 'solutionEn']
const docs = Object.entries(content).map(([key, c]) => {
  const doc = { _id: targetId(key), _type: 'gameChapter', isVisible: true }
  for (const f of FIELDS) if (c[f] !== undefined) doc[f] = c[f]
  doc.key = key
  return doc
})

console.log(`${dryRun ? '[dry run] would write' : 'Writing'} ${docs.length} rooms to ${target}:`)
for (const d of docs) {
  console.log(`  ${d._id}  answer:${d.answer ? 'yes' : '-'}  hints:${d.hints?.length ?? 0}  replies:${d.responses?.length ?? 0}  facts:${d.facts?.length ?? 0}  solution:${d.solution ? 'yes' : '-'}`)
}
if (!dryRun) {
  const tx = dst.transaction()
  for (const d of docs) tx.createOrReplace(d)
  await tx.commit()
  console.log(`Done. Next: point the site at ${target}, then run with --delete-source.`)
}
