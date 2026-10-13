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
 *   header   h1 → title, .orig → originalTitle ("Originaltittel:"/"På engelsk:"
 *            prefix stripped; "På norsk: X" swaps the
 *            two: X becomes the title, the <h1> the original), .lede → lead,
 *            .notice → notice (+ its <strong> → noticeLabel)
 *   section  walked in document order: h2 (+ p.sub) → section kind/heading;
 *            <p> and images (<figure>, ul.photos) → body text with inline
 *            images and captions; figures with .pos number markers →
 *            section figures; other lists → listItems; ol.routine /
 *            ol.steps <li> → steps (h3 inside → step title); a section-level
 *            <h3> → subsection
 *   footer   .source <p> → sourceText, <dl> → sourceFacts,
 *            .small / .credit → rightsNote
 *
 * Documents get a deterministic private ID, `lukket.kittrick-<slug>`, so
 * re-running replaces the same document instead of creating a duplicate.
 * Images are uploaded as Sanity assets (Sanity de-duplicates identical
 * files).
 *
 * An existing document is NOT overwritten unless --replace is given, so
 * edits made in Studio after an earlier import aren't lost by accident.
 * --kit=<slug> appends the trick to that tryllesett (kitCollection) after
 * writing it, unless it's already there or the kit has an unpublished draft.
 *
 * Targets the DEVELOPMENT dataset by default. Set SANITY_DATASET=lukket (the
 * private dataset behind /bak-teppet) to import for real. "production" is
 * refused: it's public, so the trick images would be listable there.
 *
 * Usage:
 *   node scripts/import-kit-trick-html.mjs [--dry-run] [--replace] [--kit=<kit-slug>] file1.html [file2.html …]
 *
 * Full procedure (writing, import, review): docs/kit-trick-operations-routine.md
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
const replace = args.includes('--replace')
const kitSlug = args.find(a => a.startsWith('--kit='))?.slice('--kit='.length) || null
const files = args.filter(a => !a.startsWith('--'))
const dataset = process.env.SANITY_DATASET ?? 'development'

// Trick descriptions reveal how tricks are done. They belong in the private
// "lukket" dataset; in the public production dataset their images would be
// listable by anyone (see schemaTypes/kitCollection.ts).
if (dataset === 'production') {
  console.error('Refusing to import into the public "production" dataset. Use SANITY_DATASET=lukket.')
  process.exit(1)
}

if (files.length === 0) {
  console.error('Usage: node scripts/import-kit-trick-html.mjs [--dry-run] [--replace] [--kit=<kit-slug>] file.html [...]')
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
  const h1 = clean($('h1').first().text())
  if (!h1) throw new Error(`${file}: no <h1>`)
  // Two header styles: "Originaltittel: X" (or "På engelsk: X") under a Norwegian <h1>, or
  // "På norsk: X" under an original-language <h1>. Normalise to Norwegian
  // title + originalTitle either way.
  const origLine = clean($('header .orig').first().text())
  const norwegian = /^På norsk:\s*/i.test(origLine) ? origLine.replace(/^På norsk:\s*/i, '') : null
  const title = norwegian ?? h1
  const originalTitle = norwegian ? h1 : origLine.replace(/^(Originaltittel|Originaltitler|På engelsk|Original):\s*/i, '')
  const slug = slugify(title)
  console.log(`\n${basename(file)} → «${title}» (${slug})`)
  let imgCount = 0
  const hint = () => `${slug}-${++imgCount}`

  const header = $('header').first()
  const notice = header.find('.notice').first()
  const noticeLabel = clean(notice.find('strong').first().text())
  const noticeFull = clean(notice.text())
  const noticeText = noticeLabel && noticeFull.startsWith(noticeLabel) ? noticeFull.slice(noticeLabel.length).trim() : noticeFull

  // Walk each <section> in document order so text, images and steps keep
  // the source's sequence. Figures with number markers stay section figures;
  // all other images become inline images in the body text (with caption).
  // An <h3> starts a subsection; content that follows a step list starts an
  // untitled continuation subsection (steps always render after the body).
  const sections = []
  const isStepList = el => $(el).is('ol.routine, ol.steps')
  // A list of photos, optionally each in a <figure> with a <figcaption>.
  const isPhotoList = el => $(el).is('ol, ul') && $(el).find('img').length > 0 &&
    !clean($(el).clone().find('figcaption').remove().end().text())

  async function inlineImage(img, caption) {
    const ref = await uploadImage($(img).attr('src'), hint())
    if (!ref) return null
    return {
      _type: 'image',
      _key: key(),
      asset: { _type: 'reference', _ref: ref },
      alt: clean($(img).attr('alt') ?? ''),
      ...(caption ? { caption } : {}),
    }
  }

  // A figure between the header and a section (e.g. a photo of the box)
  // belongs to the section that follows it: move it in right after the heading.
  for (const fig of $('figure').toArray()) {
    if ($(fig).closest('section, header, footer').length) continue
    const next = $(fig).nextAll('section').first()
    if (!next.length) continue
    const heading = next.children('h2').first()
    if (heading.length) heading.after(fig)
    else next.prepend(fig)
  }

  for (const sectionEl of $('section').toArray()) {
    const section = $(sectionEl)
    const h2 = clean(section.find('h2').first().text())
    const sub = clean(section.find('p.sub').first().text())
    const { kind, heading } = sectionKind(h2)

    const newChunk = props => ({ body: [], listItems: [], figures: [], steps: [], stepLayout: 'list', ...props })
    let cur = newChunk({ kind, heading: sub ? `${heading ?? h2}: ${sub}` : heading, first: true })
    const flush = () => {
      const hasContent = cur.body.length || cur.listItems.length || cur.figures.length || cur.steps.length
      if (!hasContent && !cur.heading && !cur.first) return
      sections.push({
        _type: 'kitTrickSection',
        _key: key(),
        kind: cur.kind,
        ...(cur.heading ? { heading: cur.heading } : {}),
        ...(cur.subsection ? { subsection: true } : {}),
        ...(cur.body.length ? { body: cur.body } : {}),
        ...(cur.listItems.length ? { listItems: cur.listItems } : {}),
        ...(cur.figures.length ? { figures: cur.figures } : {}),
        ...(cur.steps.length ? { steps: cur.steps, stepLayout: cur.stepLayout } : {}),
      })
    }
    const startSub = subHeading => { flush(); cur = newChunk({ kind: 'annet', heading: subHeading || undefined, subsection: true }) }
    const afterSteps = () => { if (cur.steps.length) startSub('') }

    async function walk(nodes) {
      for (const el of nodes) {
        if (el.type !== 'tag') continue
        const $el = $(el)
        const tag = el.tagName.toLowerCase()
        if (tag === 'h2' || $el.hasClass('sub')) continue
        if (tag === 'h3') { startSub(clean($el.text())); continue }
        if (tag === 'p') {
          afterSteps()
          const block = toBlock($, el)
          if (block) cur.body.push(block)
        } else if (tag === 'figure') {
          afterSteps()
          const caption = clean($el.find('figcaption').text())
          const markers = $el.find('.pos').toArray().map(pos => ({
            _type: 'kitMarker',
            _key: key(),
            label: clean($(pos).text()),
            top: Number((/top:\s*([\d.]+)%/.exec($(pos).attr('style') ?? '') ?? [])[1] ?? 50),
          }))
          if (markers.length) {
            const f = await toFigure($, $el.find('img').first(), caption, markers, hint())
            if (f) cur.figures.push(f)
          } else {
            const im = await inlineImage($el.find('img').first(), caption)
            if (im) cur.body.push(im)
          }
        } else if (tag === 'img') {
          afterSteps()
          const im = await inlineImage(el, '')
          if (im) cur.body.push(im)
        } else if (isStepList(el)) {
          if (cur.steps.length) startSub('')
          cur.stepLayout = $el.hasClass('steps') ? 'cards' : 'list'
          for (const li of $el.children('li').toArray()) {
            const stepFigures = []
            for (const img of $(li).find('img').toArray()) {
              const f = await toFigure($, img, clean($(img).closest('figure').find('figcaption').text()), [], hint())
              if (f) stepFigures.push(f)
            }
            const stepTitle = clean($(li).find('h3').first().text())
            cur.steps.push({
              _type: 'kitStep',
              _key: key(),
              ...(stepTitle ? { title: stepTitle } : {}),
              text: blocksOf($, $(li).find('p')),
              ...(stepFigures.length ? { figures: stepFigures } : {}),
            })
          }
        } else if (isPhotoList(el)) {
          afterSteps()
          for (const img of $el.find('img').toArray()) {
            const im = await inlineImage(img, clean($(img).closest('figure').find('figcaption').text()))
            if (im) cur.body.push(im)
          }
        } else if (tag === 'ol' || tag === 'ul') {
          afterSteps()
          cur.listItems.push(...$el.children('li').toArray().map(li => clean($(li).text())).filter(Boolean))
        } else {
          await walk(el.children ?? [])
        }
      }
    }
    await walk(section.children().toArray())
    flush()
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
    ...(originalTitle ? { originalTitle } : {}),
    ...(header.find('.lede').length ? { lead: clean(header.find('.lede').text()) } : {}),
    ...(noticeText ? { notice: noticeText, noticeLabel: noticeLabel || '' } : {}),
    sections,
    ...(sourceText.length ? { sourceText } : {}),
    ...(sourceFacts.length ? { sourceFacts } : {}),
    ...(rightsNote ? { rightsNote } : {}),
  }

  // First figure in the document doubles as the card image.
  // First image in the document (figure, inline or step) doubles as the card image.
  const firstImage = sections.flatMap(s => [
    ...(s.body ?? []).filter(b => b._type === 'image'),
    ...(s.figures ?? []).map(f => f.image),
    ...(s.steps ?? []).flatMap(st => (st.figures ?? []).map(f => f.image)),
  ])[0]
  if (firstImage) doc.coverImage = { _type: 'image', asset: firstImage.asset, alt: firstImage.alt }

  console.log(`  ${sections.length} sections: ${sections.map(s => (s.subsection ? '↳' : '') + (s.heading ?? s.kind)).join(', ')}`)
  const existing = token ? await client.fetch('*[_id in [$id, "drafts." + $id]]._id', { id: doc._id }) : []
  if (existing.length && !replace) {
    console.log(`  ! ${doc._id} already exists in ${dataset} — skipped. Use --replace to overwrite it (this discards edits made in Studio).`)
    return null
  }
  if (dryRun) {
    console.log(`  [dry-run] would ${existing.length ? 'replace' : 'create'} ${doc._id}`)
  } else {
    await client.createOrReplace(doc)
    console.log(`  ✓ wrote ${doc._id} to ${dataset}`)
  }
  return doc._id
}

// Appends the trick to a tryllesett, the same way an editor would in Studio.
async function findKit() {
  const kits = await client.fetch(
    '*[_type == "kitCollection" && _id in path("lukket.**")]{ _id, title, "slug": slug.current, "refs": tricks[]._ref }',
  )
  const kit = kits.find(k => k.slug === kitSlug)
  if (!kit) {
    console.error(`No tryllesett with slug "${kitSlug}" in ${dataset}. Available: ${kits.map(k => k.slug).join(', ') || '(none)'}`)
    process.exit(1)
  }
  return kit
}

async function addToKit(trickId) {
  const kit = await findKit()
  if ((kit.refs ?? []).includes(trickId)) {
    console.log(`  = already in «${kit.title}»`)
    return
  }
  if (await client.fetch('count(*[_id == $id])', { id: `drafts.${kit._id}` })) {
    console.log(`  ! «${kit.title}» has unpublished changes in Studio — add the trick there instead.`)
    return
  }
  if (dryRun) {
    console.log(`  [dry-run] would add to «${kit.title}»`)
    return
  }
  await client
    .patch(kit._id)
    .setIfMissing({ tricks: [] })
    .append('tricks', [{ _type: 'reference', _ref: trickId, _key: key() }])
    .commit()
  console.log(`  ✓ added to «${kit.title}»`)
}

console.log(`Dataset: ${dataset}${dryRun ? ' (dry run)' : ''}`)
if (kitSlug && token) await findKit() // fail before uploading anything
for (const file of files) {
  const id = await importFile(file)
  if (id && kitSlug) await addToKit(id)
}
