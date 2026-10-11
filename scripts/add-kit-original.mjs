#!/usr/bin/env node
/**
 * add-kit-original.mjs
 *
 * Stores an original instruction sheet (PDF) as a `kitOriginal` document
 * ("Originalbeskrivelse", see schemaTypes/kitOriginal.ts) and links it from
 * one or more tricks (`kitTrick.originals`).
 *
 * Access defaults to "archive": the PDF is kept but never shown. Use
 * --access=closed only when the museum owns the rights (--own) or has
 * permission — the Studio shows a warning otherwise.
 *
 * Usage:
 *   SANITY_DATASET=lukket node scripts/add-kit-original.mjs \
 *     --title="Ball & Vase — Read and keep" --trick=ball-og-vase [--trick=…] \
 *     [--publisher="DiFattaMagic srl"] [--year=2015] [--covers="punkt 18–21"] \
 *     [--languages=en,it] [--access=archive|closed|public] [--own] \
 *     [--rights-holder="…"] [--archive-note="…"] [--dry-run] file.pdf
 *
 * Targets the development dataset by default and refuses "production" (public:
 * the PDF would be listable there). Token: SANITY_API_TOKEN / SANITY_TOKEN /
 * SANITY_AUTH_TOKEN.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { basename } from 'path'
import { randomUUID } from 'crypto'

const argv = process.argv.slice(2)
const opt = name => argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const opts = name => argv.filter(a => a.startsWith(`--${name}=`)).map(a => a.slice(name.length + 3))
const flag = name => argv.includes(`--${name}`)
const file = argv.find(a => !a.startsWith('--'))

const dataset = process.env.SANITY_DATASET ?? 'development'
const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN
const title = opt('title')
const access = opt('access') ?? 'archive'
const tricks = opts('trick')
const dryRun = flag('dry-run')

const fail = msg => { console.error(msg); process.exit(1) }
if (dataset === 'production') fail('Refusing the public "production" dataset. Use SANITY_DATASET=lukket.')
if (!file || !title) fail('Usage: add-kit-original.mjs --title="…" [--trick=<slug>]… [options] file.pdf')
if (!file.toLowerCase().endsWith('.pdf')) fail(`${file}: expected a PDF`)
if (!['archive', 'closed', 'public'].includes(access)) fail(`--access must be archive, closed or public (got "${access}")`)
if (!token) fail('No Sanity token (SANITY_API_TOKEN / SANITY_TOKEN / SANITY_AUTH_TOKEN).')

const client = createClient({ projectId: 'n2ynpgty', dataset, apiVersion: '2024-01-01', useCdn: false, token, perspective: 'raw' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
// Same slug convention as the trick importer (besøk → besok).
const slugify = text => text.toLowerCase()
  .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .slice(0, 80)

const id = `lukket.kitoriginal-${slugify(title)}`
console.log(`Dataset: ${dataset}${dryRun ? ' (dry run)' : ''}\n«${title}» → ${id} (access: ${access})`)

if (await client.fetch('count(*[_id in [$id, "drafts." + $id]])', { id })) {
  fail(`  ! ${id} already exists — edit it in Studio instead.`)
}

// Resolve the tricks first, so a typo fails before anything is uploaded.
const trickDocs = []
for (const slug of tricks) {
  const t = await client.fetch(
    '*[_type == "kitTrick" && slug.current == $slug && _id in path("lukket.**")][0]{ _id, title, "refs": originals[]._ref }',
    { slug },
  )
  if (!t) fail(`  ! No trick with slug "${slug}" in ${dataset}.`)
  if (await client.fetch('count(*[_id == $id])', { id: `drafts.${t._id}` })) {
    fail(`  ! «${t.title}» has unpublished changes in Studio — publish or discard them first.`)
  }
  trickDocs.push(t)
}

if (dryRun) {
  console.log(`  [dry-run] would upload ${basename(file)} and create ${id}`)
  trickDocs.forEach(t => console.log(`  [dry-run] would link from «${t.title}»`))
  process.exit(0)
}

const asset = await client.assets.upload('file', readFileSync(file), { filename: basename(file), contentType: 'application/pdf' })
console.log(`  uploaded ${basename(file)} → ${asset._id}`)

const languages = opt('languages')?.split(',').map(s => s.trim()).filter(Boolean)
await client.create({
  _id: id,
  _type: 'kitOriginal',
  isVisible: true,
  title,
  file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
  access,
  museumOwnsRights: flag('own'),
  ...(languages?.length ? { languages } : {}),
  ...(opt('publisher') ? { publisher: opt('publisher') } : {}),
  ...(opt('year') ? { year: Number(opt('year')) } : {}),
  ...(opt('covers') ? { covers: opt('covers') } : {}),
  ...(opt('rights-holder') ? { rightsHolder: opt('rights-holder') } : {}),
  ...(opt('archive-note') ? { archiveNote: opt('archive-note') } : {}),
})
console.log(`  ✓ created ${id}`)

for (const t of trickDocs) {
  if ((t.refs ?? []).includes(id)) continue
  await client.patch(t._id).setIfMissing({ originals: [] })
    .append('originals', [{ _type: 'reference', _ref: id, _key: key() }]).commit()
  console.log(`  ✓ linked from «${t.title}»`)
}
