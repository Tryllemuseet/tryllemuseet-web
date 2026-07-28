/**
 * strip-date-prefix-from-fullbio.mjs
 *
 * Removes the "F. DD.MM.YYYY. i STED. D. [DD.MM.YYYY.|YYYY.]" date prefix
 * from the start of biography.fullBio, now that the same information lives
 * in the structured birthDate/deathDate/birthPlace fields (see
 * migrate-biography-dates.mjs). Only touches documents where that script
 * successfully matched the prefix — uses the identical regex so it only
 * strips text it can account for.
 *
 * If stripping the prefix empties the first block entirely, that block
 * (and an immediately-following empty spacer block, a pattern the source
 * book import produces between paragraphs) is dropped so the article
 * starts directly at the first real sentence. If text remains after the
 * prefix in the same block (e.g. "F. 25.12.1961. Medlem av..."), only the
 * matched prefix is removed and the block is kept.
 *
 * Idempotent: re-running finds nothing left to strip (the regex requires
 * the text to start with "F.").
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/strip-date-prefix-from-fullbio.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN).')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (fjerner dato-prefiks fra biography.fullBio). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// Identical to the extraction regex in migrate-biography-dates.mjs
const FD_RE = /^F\.?\s*(?:(\d{1,2})[.\s]*[.\/](\d{1,2})[.\/]\s*)?(\d{2,4})\s*[.,]?\s*(?:i\s+([^.,]+)[.,]?\s*)?(?:D\.?\s*(?:(\d{1,2})[.\/](\d{1,2})[.\/]\s*)?(\d{2,4})\s*[.,]?)?/i

function blockText(block) {
  return (block.children ?? []).map(c => c.text ?? '').join('')
}

function isEmptyBlock(block) {
  return !blockText(block).trim()
}

const docs = await client.fetch(`
  *[_type == "biography" && defined(birthDate) && defined(fullBio) && count(fullBio) > 0]{
    _id, name, fullBio
  }
`)
console.log(`${docs.length} biography-dokumenter med birthDate og fullBio å sjekke.`)

let stripped = 0
let noMatch = 0

for (const doc of docs) {
  const blocks = doc.fullBio
  const first = blocks[0]
  if (first?._type !== 'block' || (first.children ?? []).length !== 1) { noMatch++; continue }

  const text = blockText(first)
  const m = text.match(FD_RE)
  if (!m || !m[0].trim()) { noMatch++; continue }

  const remainder = text.slice(m[0].length).trim()
  let newBlocks

  if (!remainder) {
    // First block was pure date-prefix — drop it, and drop a following empty spacer too.
    const dropSpacer = blocks[1] && isEmptyBlock(blocks[1])
    newBlocks = blocks.slice(dropSpacer ? 2 : 1)
  } else {
    // Keep the block, just strip the matched prefix from its span text.
    const newChildren = first.children.map((c, i) =>
      i === 0 ? { ...c, text: c.text.slice(c.text.indexOf(m[0]) + m[0].length).replace(/^\s+/, '') } : c
    )
    newBlocks = [{ ...first, children: newChildren }, ...blocks.slice(1)]
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}${doc._id} (${doc.name}): strip "${m[0].trim()}"${remainder ? '' : ' (drop block)'}`)
  if (!dryRun) {
    await client.patch(doc._id).set({ fullBio: newBlocks }).commit()
  }
  stripped++
}

console.log(`Ferdig. ${stripped} dokumenter ${dryRun ? 'ville blitt' : 'ble'} renset, ${noMatch} hadde ingen match (allerede renset, eller uventet struktur).`)
