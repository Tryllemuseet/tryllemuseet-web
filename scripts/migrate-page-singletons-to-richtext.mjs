/**
 * migrate-page-singletons-to-richtext.mjs
 *
 * A batch of page-singleton "longer text" fields changed from plain `text`
 * strings to arrays of Portable Text blocks (richBlockContent), so editors
 * can add links and inline images — part of the same schema-wide riktekst
 * audit as the other migrate-*-to-richtext.mjs scripts. Grouped into one
 * script since each field lives on a different singleton document (one
 * document per type, unlike the per-entry artifact/historiskeKlippNb/
 * magicClubEdition migrations), so there's no bulk document-count to chunk.
 *
 * Fields covered:
 *   - omOssPage:   omMuseet.formalTekst, medlemskap.motivasjonsTekst,
 *                  frivillig.tekst, presse.tekst
 *   - kursPage:    omKurset.tekst
 *   - besokPage:   medlemskapSeksjon.tekst, forestillingerSeksjon.tekst
 *   - barnPage:    skolebesok.tekst
 *   - homepage:    medlemSeksjon.tekst
 *   - siteConfig:  donationText
 *   - kontaktPage: faq[].svar (one conversion per FAQ entry)
 *
 * This wraps each existing plain-string value into one Portable Text block
 * per blank-line-separated paragraph. No text is changed, only re-wrapped.
 *
 * Idempotent: skips any field that is already an array (already migrated),
 * unless run with --force. Skips a whole document if it doesn't exist yet
 * (nothing to migrate — the page's code-level fallback text already covers
 * that case).
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/migrate-page-singletons-to-richtext.mjs [--dry-run] [--force]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/migrate-page-singletons-to-richtext.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (konverterer flere side-tekstfelt til riktekst). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

function textToBlocks(text, keyPrefix) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map((paragraph, i) => ({
      _type: 'block',
      _key: `${keyPrefix}-${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `${keyPrefix}-${i}-s`, text: paragraph, marks: [] }],
    }))
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

// Simple field targets: { type, path, keyPrefix }
const TARGETS = [
  { type: 'omOssPage',  path: 'omMuseet.formalTekst',       keyPrefix: 'formal' },
  { type: 'omOssPage',  path: 'medlemskap.motivasjonsTekst', keyPrefix: 'motivasjon' },
  { type: 'omOssPage',  path: 'frivillig.tekst',             keyPrefix: 'frivillig' },
  { type: 'omOssPage',  path: 'presse.tekst',                keyPrefix: 'presse' },
  { type: 'kursPage',   path: 'omKurset.tekst',              keyPrefix: 'omkurset' },
  { type: 'besokPage',  path: 'medlemskapSeksjon.tekst',     keyPrefix: 'medlemskap' },
  { type: 'besokPage',  path: 'forestillingerSeksjon.tekst', keyPrefix: 'forestillinger' },
  { type: 'barnPage',   path: 'skolebesok.tekst',            keyPrefix: 'skolebesok' },
  { type: 'homepage',   path: 'medlemSeksjon.tekst',         keyPrefix: 'medlem' },
  { type: 'siteConfig', path: 'donationText',                keyPrefix: 'donation' },
]

async function run() {
  const patchesByType = new Map()
  const report = []

  for (const { type, path, keyPrefix } of TARGETS) {
    const doc = await client.fetch(
      `*[_type == $type && !(_id in path("drafts.**"))][0]{ _id, "value": ${path} }`,
      { type }
    )
    if (!doc?._id) { report.push(`⏭️  ${type}.${path}: intet dokument funnet — hoppes over.`); continue }
    if (Array.isArray(doc.value)) { report.push(`⏭️  ${type}.${path}: allerede riktekst.`); continue }
    if (typeof doc.value !== 'string' || (!doc.value.trim() && !force)) {
      report.push(`⏭️  ${type}.${path}: tomt/udefinert — hoppes over.`)
      continue
    }
    const blocks = textToBlocks(doc.value, `${keyPrefix}-${doc._id.slice(-6)}`)
    if (!patchesByType.has(type)) patchesByType.set(type, { id: doc._id, fields: {} })
    patchesByType.get(type).fields[path] = blocks
    report.push(`✏️  ${type}.${path}: ${blocks.length} avsnitt vil bli skrevet.`)
  }

  // kontaktPage.faq[].svar — array of objects, needs a full-array rewrite
  const kontakt = await client.fetch(
    `*[_type == "kontaktPage" && !(_id in path("drafts.**"))][0]{ _id, faq }`
  )
  let kontaktFaqPatch = null
  if (kontakt?._id && Array.isArray(kontakt.faq) && kontakt.faq.length) {
    const anyString = kontakt.faq.some(item => typeof item.svar === 'string')
    if (anyString || force) {
      kontaktFaqPatch = kontakt.faq.map((item, i) => ({
        ...item,
        svar: Array.isArray(item.svar) ? item.svar : textToBlocks(item.svar ?? '', `faq-${i}`),
      }))
      report.push(`✏️  kontaktPage.faq[].svar: ${kontakt.faq.length} spørsmål vil bli konvertert.`)
    } else {
      report.push('⏭️  kontaktPage.faq[].svar: allerede riktekst.')
    }
  } else {
    report.push('⏭️  kontaktPage.faq: intet dokument/ingen spørsmål funnet — hoppes over.')
  }

  console.log(report.join('\n'))

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  if (patchesByType.size === 0 && !kontaktFaqPatch) {
    console.log('\nIngenting å gjøre.')
    return
  }

  for (const [type, { id, fields }] of patchesByType) {
    await client.patch(id).set(fields).commit()
    console.log(`✅ Patchet ${type} (${id}).`)
  }
  if (kontaktFaqPatch) {
    await client.patch(kontakt._id).set({ faq: kontaktFaqPatch }).commit()
    console.log(`✅ Patchet kontaktPage (${kontakt._id}).`)
  }

  console.log('\n✅ Ferdig.')
}

run().catch(err => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
