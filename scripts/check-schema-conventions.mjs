#!/usr/bin/env node
/**
 * check-schema-conventions.mjs
 *
 * Enforces two schema conventions documented in CLAUDE.md that have
 * historically been easy to forget when adding a new field or document
 * type, because nothing previously caught a violation before it shipped:
 *
 *   1. Every content document type should have an `isVisible` boolean
 *      field ("Vis på nettsted") so editors can unpublish without
 *      deleting. See "Visibility / Unpublish Convention" in CLAUDE.md.
 *   2. Every "longer text" field (a `text` field wide enough to hold
 *      real prose) should be Portable Text via richBlockContent()
 *      (schemaTypes/richBlockContent.ts) — not a plain string — so
 *      editors can add bold/italic/links/inline images. See
 *      "Rich Text (Portable Text)" in CLAUDE.md.
 *
 * This is a heuristic static scan of schemaTypes/*.ts, not a real
 * TypeScript/AST parser — it works by pattern-matching the field-
 * definition style this codebase already uses consistently
 * (`defineField({ name: '...', title: '...', type: '...', rows: N })`).
 * It WILL have false positives and false negatives. The two allowlists
 * below are the intentional pressure valve: a field or document type
 * that legitimately doesn't need the convention gets added there, with
 * a one-line reason, as a normal reviewable line in the PR diff —
 * instead of the check silently never having existed at all.
 *
 * Exit code 0 = clean, 1 = violations found (fails CI).
 *
 * Usage: node scripts/check-schema-conventions.mjs
 */

import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaDir = join(__dirname, '..', 'schemaTypes')

// Below this many rows, a `text` field is treated as a short caption/intro/
// teaser by convention (matches the many `rows: 2`/`rows: 3` ingress/teaser/
// beskrivelse fields already throughout the schema) and is not flagged.
const ROWS_THRESHOLD = 4

// Helper/object schema files that never define a standalone `document` type
// and aren't part of the isVisible convention at all — skipped entirely.
const SKIP_FILES = new Set([
  'index.ts',
  'richBlockContent.ts',
  'contentSection.ts',
  'sourceItem.ts',
  'partialDate.ts',
])

// Document types that intentionally have NO isVisible field, and why.
// (Kept in sync with the "Visibility / Unpublish Convention" section of
// CLAUDE.md — if you add a document type here, add the same reasoning
// there too.)
const NO_ISVISIBLE_ALLOWLIST = {
  siteConfig: 'global settings singleton, not content',
  godeRadConfig: 'settings singleton, not content',
  signageConfig: 'settings singleton, not content',
  quizConfig: 'has isActive instead',
  gameConfig: 'has isActive instead',
  homepage: 'page singleton — never listed/filtered',
  besokPage: 'page singleton',
  utstillingPage: 'page singleton',
  tryllebutikkenPage: 'page singleton',
  barnPage: 'page singleton',
  aktiviteterPage: 'page singleton',
  tryllehistoriePage: 'page singleton',
  ressurserPage: 'page singleton',
  omOssPage: 'page singleton',
  kontaktPage: 'page singleton',
  personvernPage: 'page singleton',
  kursPage: 'page singleton',
  qrCode: 'pivot/reference document, not standalone content',
  source: 'citation registry entry, referenced by other docs, not browsed directly',
  signageQuote: 'infoskjerm content — has its own active toggle',
  signageVideo: 'infoskjerm content — has its own active toggle',
  youtubeSource: 'sync-job config, not visitor-facing content',
  siteNavigation: 'visibility modeled per nested navMainArea/navSubArea item',
}

// `<file>:<fieldName>` fields confirmed short/technical/character-constrained
// during the 2026-09 riktekst audit — deliberately left as plain text. Add a
// reason when you add an entry.
const PLAIN_TEXT_ALLOWLIST = {
  'mediaAppearance.ts:quote': 'short press quote/excerpt',
  'story.ts:someText': 'social media caption',
  'gameChapter.ts:intro': 'has a richBlockContent sibling field (introRich) for when formatting is needed',
  'gameChapter.ts:introEn': 'has a richBlockContent sibling field (introRichEn) for when formatting is needed',
  'biography.ts:shortBio': 'validated max 280 chars — listing card text',
  'artifact.ts:description': 'short card/list description',
  'artifact.ts:childText': 'validated max 300 chars — short children\'s text',
  'legend.ts:childText': 'physical wall-panel text, character-constrained',
  'historiskeKlippNb.ts:originalFullText': 'internal only — never reaches the frontend',
  'historiskeKlippNb.ts:commentary': 'explicitly "kort kontekst" (short context) per its own field description',
  'historiskeKlippNb.ts:someText': 'social media caption',
  'historiskeKlippNb.ts:instagramText': 'social media caption',
  'historiskeKlippNb.ts:tiktokText': 'social media caption',
}

const files = readdirSync(schemaDir)
  .filter(f => f.endsWith('.ts') && !SKIP_FILES.has(f))

const violations = []

for (const file of files) {
  const content = readFileSync(join(schemaDir, file), 'utf-8')
  const lines = content.split('\n')

  // ── 1. isVisible coverage ──────────────────────────────────────
  const isDocument = /type:\s*['"]document['"]/.test(content)
  if (isDocument) {
    const typeNameMatch = content.match(/defineType\(\{\s*name:\s*['"]([a-zA-Z0-9]+)['"]/)
    const typeName = typeNameMatch?.[1] ?? file.replace(/\.ts$/, '')
    const hasIsVisible = /name:\s*['"]isVisible['"]/.test(content)
    if (!hasIsVisible && !(typeName in NO_ISVISIBLE_ALLOWLIST)) {
      violations.push(
        `${file}: document type "${typeName}" has no isVisible field.\n` +
        `    Add one (see schemaTypes/artifact.ts for the standard pattern), or if it's ` +
        `intentional, add "${typeName}" to NO_ISVISIBLE_ALLOWLIST in this script with a reason.`
      )
    }
  }

  // ── 2. Plain long-text fields that should be richBlockContent() ─
  for (let i = 0; i < lines.length; i++) {
    if (!/type:\s*['"]text['"]/.test(lines[i])) continue

    let rows = null
    for (let j = i; j < Math.min(i + 3, lines.length); j++) {
      const m = lines[j].match(/rows:\s*(\d+)/)
      if (m) { rows = Number(m[1]); break }
    }
    // No explicit `rows` on a `type: 'text'` field means Studio's default
    // (3 rows) — treated the same as an explicit low rows count, i.e. not
    // flagged, since most short ingress/teaser fields omit rows.
    if (rows === null || rows < ROWS_THRESHOLD) continue

    let fieldName = null
    for (let j = i; j >= Math.max(0, i - 5); j--) {
      const m = lines[j].match(/name:\s*['"]([a-zA-Z0-9]+)['"]/)
      if (m) { fieldName = m[1]; break }
    }
    if (!fieldName) continue

    const key = `${file}:${fieldName}`
    if (key in PLAIN_TEXT_ALLOWLIST) continue

    violations.push(
      `${file}: field "${fieldName}" is plain text with rows >= ${ROWS_THRESHOLD} (looks like prose).\n` +
      `    Convert to \`type: 'array', of: richBlockContent()\` (see schemaTypes/richBlockContent.ts), ` +
      `or if it's genuinely short/technical, add "${key}" to PLAIN_TEXT_ALLOWLIST in this script with a reason.`
    )
  }
}

if (violations.length === 0) {
  console.log(`✅ Schema conventions OK (${files.length} filer sjekket).`)
  process.exit(0)
}

console.error(`❌ ${violations.length} brudd på skjemakonvensjoner funnet:\n`)
for (const v of violations) console.error(`- ${v}\n`)
process.exit(1)
