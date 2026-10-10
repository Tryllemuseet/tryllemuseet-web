#!/usr/bin/env node
/**
 * import-kit-trick-html.mjs
 *
 * Imports trick instruction pages (HTML files in the "Tryllekunst ·
 * Bruksanvisning" layout, e.g. translations made with Claude) as
 * `kitTrick` documents ("Tryllebeskrivelse", see schemaTypes/kitTrick.ts),
 * including their embedded images.
 *
 * What it recognises (anything else is skipped with a warning):
 *   header   h1 → title, .orig → originalTitle, .lede → lead,
 *            .notice → notice (+ its <strong> → noticeLabel)
 *   section  h2 → section kind/heading; <p> → body; ol.props / plain
 *            lists → listItems; <figure> → figures (incl. .pos markers);
 *            ol.routine / ol.steps <li> → steps (h3 → step title)
 *   footer   .source <p> → sourceText, <dl> → sourceFacts,
 *            .small / .credit → rightsNote
 *
 * Documents get a deterministic private ID, `lukket.kittrick-<slug>`, so
 * re-running replaces the same document instead of creating a duplicate.
 * Images are uploaded as Sanity assets (Sanity de-duplicates identical
 * files). The tricks are NOT added to any tryllesett — do that in Studio.
 *
 * Targets the DEVELOPMENT dataset by default. Set SANITY_DATASET=production
 * to import for real.
 *
 * Usage:
 *   node scripts/import-kit-trick-html.mjs [--dry-run] file1.html [file2.html …]
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or the
 *    local Sanity CLI login)
 */

import { createClient } from '@sanity/client'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { join, basename } from 'path'
import { homedir } from 'os'
import { randomUUID } from 'crypto'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const files = args.filter(a => !a.startsWith('--'))
const dataset = process.env.SANITY_DATASET ?? 'development'

if (files.length === 0) {
  console.error('Usage: node scripts/import-kit-trick-html.mjs [--dry-run] file.html [...]')
  process.exit(1)
}

function getStoredToken() {
  try {
    const config = JSON.parse(readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN ?? getStoredToken()
if (!token && !dryRun) {
  console.error('No Sanity token found (SANITY_API_TOKEN / SANITY_TOKEN / SANITY_AUTH_TOKEN or `sanity login`).')
  process.exit(1)
}

const client = createClient({ projectId: 'n2ynpgty', dataset, apiVersion: '2024-01-01', useCdn: false, token })

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

// Matches the slug convention elsewhere in the project (besøk → besok).
function slugify(text) {
  return text.toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

const SECTION_KINDS = [
  [/^effekt/i, 'effekt', 'Effekt'],
  [/^hemmelighet/i, 'hemmeligheten', 'Hemmeligheten'],
  [/^rekvisitt/i, 'rekvisitter', 'Rekvisitter'],
  [/^forberedelse/i, 'forberedelse', 'Forberedelse'],
  [/^utf(ø|o)relse/i, 'utforelse', 'Utførelse'],
  [/^tips/i, 'tips', 'Tips'],
]

function sectionKind(heading) {
  for (const [re, kind, defaultTitle] of SECTION_KINDS) {
    if (re.test(heading)) return { kind, heading: heading === defaultTitle ? undefined : heading }
  }
  return { kind: 'annet', heading }
}

const clean = text => text.replace(/\s+/g, ' ').trim()

// <p> (with <strong>/<em>/<b>/<i>) → one Portable Text block.
function toBlock($, el) {
  const children = []
  const walk = (node, marks) => {
    if (node.type === 'text') {
      const text = node.data.replace(/\s+/g, ' ')
      if (text) children.push({ _type: 'span', _key: key(), text, marks })
      return
    }
    if (node.type !== 'tag') return
    const tag = node.tagName.toLowerCase()
    const extra = tag === 'strong' || tag === 'b' ? ['strong'] : tag === 'em' || tag === 'i' ? ['em'] : []
    if (tag === 'br') { children.push({ _type: 'span', _key: key(), text: '\n', marks }); return }
    for (const child of node.children ?? []) walk(child, [...marks, ...extra])
  }
  for (const child of el.childNodes ?? el.children ?? []) walk(child, [])
  if (children.length) {
    children[0].text = children[0].text.replace(/^\s+/, '')
    children[children.length - 1].text = children[children.length - 1].text.replace(/\s+$/, '')
  }
  const nonEmpty = children.filter(c => c.text)
  if (!nonEmpty.length) return null
  return { _type: 'block', _key: key(), style: 'normal', markDefs: [], children: nonEmpty }
}

const blocksOf = ($, els) => els.toArray().map(el => toBlock($, el)).filter(Boolean)

const uploads = new Map()
async function uploadImage(src, filenameHint) {
  const m = /^data:(image\/[\w+.-]+);base64,(.+)$/s.exec(src ?? '')
  if (!m) {
    console.warn(`  ! skipping non-embedded image (${(src ?? '').slice(0, 60)}…)`)
    return null
  }
  if (uploads.has(m[2])) return uploads.get(m[2])
  const ext = m[1].split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg')
  const buffer = Buffer.from(m[2], 'base64')
  let ref
  if (dryRun) {
    ref = `dry-run-${uploads.size + 1}`
  } else {
    const asset = await client.assets.upload('image', buffer, { filename: `${filenameHint}.${ext}` })
    ref = asset._id
  }
  console.log(`  image ${filenameHint}.${ext} (${Math.round(buffer.length / 1024)} kB) → ${ref}`)
  uploads.set(m[2], ref)
  return ref
}

async function toFigure($, imgEl, caption, markers, hint) {
  const ref = await uploadImage($(imgEl).attr('src'), hint)
  if (!ref) return null
  return {
    _type: 'kitFigure',
    _key: key(),
    image: { _type: 'image', asset: { _type: 'reference', _ref: ref }, alt: clean($(imgEl).attr('alt') ?? '') },
    ...(caption ? { caption } : {}),
    ...(markers?.length ? { markers } : {}),
  }
}

async function importFile(file) {
  const $ = cheerio.load(readFileSync(file, 'utf-8'))
  const title = clean($('h1').first().text())
  if (!title) throw new Error(`${file}: no <h1>`)
  const slug = slugify(title)
  console.log(`\n${basename(file)} → «${title}» (${slug})`)
  let imgCount = 0
  const hint = () => `${slug}-${++imgCount}`

  const header = $('header').first()
  const notice = header.find('.notice').first()
  const noticeLabel = clean(notice.find('strong').first().text())
  const noticeFull = clean(notice.text())
  const noticeText = noticeLabel && noticeFull.startsWith(noticeLabel) ? noticeFull.slice(noticeLabel.length).trim() : noticeFull

  const sections = []
  for (const sectionEl of $('section').toArray()) {
    const section = $(sectionEl)
    const { kind, heading } = sectionKind(clean(section.find('h2').first().text()))
    const notInLi = (_, el) => $(el).parents('li').length === 0

    const body = blocksOf($, section.find('p').filter(notInLi).filter((_, el) => $(el).parents('figure').length === 0))

    const stepLists = section.find('ol.routine, ol.steps')
    const listItems = section.find('ol, ul').not(stepLists).children('li').toArray().map(li => clean($(li).text())).filter(Boolean)

    const figures = []
    for (const fig of section.find('figure').filter(notInLi).toArray()) {
      const markers = $(fig).find('.pos').toArray().map(pos => ({
        _type: 'kitMarker',
        _key: key(),
        label: clean($(pos).text()),
        top: Number((/top:\s*([\d.]+)%/.exec($(pos).attr('style') ?? '') ?? [])[1] ?? 50),
      }))
      const f = await toFigure($, $(fig).find('img').first(), clean($(fig).find('figcaption').text()), markers, hint())
      if (f) figures.push(f)
    }

    const steps = []
    for (const li of stepLists.children('li').toArray()) {
      const stepFigures = []
      for (const img of $(li).find('img').toArray()) {
        const f = await toFigure($, img, '', [], hint())
        if (f) stepFigures.push(f)
      }
      const stepTitle = clean($(li).find('h3').first().text())
      steps.push({
        _type: 'kitStep',
        _key: key(),
        ...(stepTitle ? { title: stepTitle } : {}),
        text: blocksOf($, $(li).find('p')),
        ...(stepFigures.length ? { figures: stepFigures } : {}),
      })
    }

    sections.push({
      _type: 'kitTrickSection',
      _key: key(),
      kind,
      ...(heading ? { heading } : {}),
      ...(body.length ? { body } : {}),
      ...(listItems.length ? { listItems } : {}),
      ...(figures.length ? { figures } : {}),
      ...(steps.length ? { steps, stepLayout: stepLists.first().hasClass('steps') ? 'cards' : 'list' } : {}),
    })
  }

  const footer = $('footer').first()
  const source = footer.find('.source')
  const sourceText = blocksOf($, source.find('p'))
  const sourceFacts = source.find('dt').toArray().map(dt => ({
    _type: 'kitFact',
    _key: key(),
    label: clean($(dt).text()),
    value: clean($(dt).next('dd').text()),
  }))
  const rightsNote = clean(footer.find('.small, .credit').toArray().map(el => $(el).text()).join(' '))

  const doc = {
    _id: `lukket.kittrick-${slug}`,
    _type: 'kitTrick',
    isVisible: true,
    title,
    slug: { _type: 'slug', current: slug },
    ...(header.find('.orig').length ? { originalTitle: clean(header.find('.orig').text()).replace(/^Originaltittel:\s*/i, '') } : {}),
    ...(header.find('.lede').length ? { lead: clean(header.find('.lede').text()) } : {}),
    ...(noticeText ? { notice: noticeText, noticeLabel: noticeLabel || '' } : {}),
    sections,
    ...(sourceText.length ? { sourceText } : {}),
    ...(sourceFacts.length ? { sourceFacts } : {}),
    ...(rightsNote ? { rightsNote } : {}),
  }

  // First figure in the document doubles as the card image.
  const firstFigure = sections.flatMap(s => [...(s.figures ?? []), ...(s.steps ?? []).flatMap(st => st.figures ?? [])])[0]
  if (firstFigure) doc.coverImage = { ...firstFigure.image }

  console.log(`  ${sections.length} sections: ${sections.map(s => s.heading ?? s.kind).join(', ')}`)
  if (dryRun) {
    console.log(`  [dry-run] would write ${doc._id}`)
  } else {
    await client.createOrReplace(doc)
    console.log(`  ✓ wrote ${doc._id} to ${dataset}`)
  }
}

console.log(`Dataset: ${dataset}${dryRun ? ' (dry run)' : ''}`)
for (const file of files) await importFile(file)
