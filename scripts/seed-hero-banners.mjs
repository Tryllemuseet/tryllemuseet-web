/**
 * seed-hero-banners.mjs
 *
 * Seeds the frontpage hero banner carousel (homepage.heroBannere) with the
 * five teasers agreed for the AMM-style top banner: the Houdini exhibition,
 * the children's page, activities, magic history and Who's Who. Each banner
 * is a short two-part text + button + link; the Houdini banner reuses the
 * main image of the houdini legend document, the rest are created without an
 * image so an editor can upload a fitting photo/video in Studio afterwards
 * (the frontend shows a starfield backdrop until then).
 *
 * Uses setIfMissing on the heroBannere field, so re-runs never overwrite
 * banners that have since been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default (explicitly requested for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-hero-banners.mjs [--dry-run]
 *   (token from SANITY_API_TOKEN, SANITY_TOKEN, SANITY_AUTH_TOKEN or
 *    the local Sanity CLI login)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dryRun = process.argv.includes('--dry-run')
const dataset = process.env.SANITY_DATASET ?? 'production'

function getStoredToken() {
  try {
    const configPath = join(homedir(), '.config', 'sanity', 'config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config?.authToken ?? null
  } catch {
    return null
  }
}

const token =
  process.env.SANITY_API_TOKEN ??
  process.env.SANITY_TOKEN ??
  process.env.SANITY_AUTH_TOKEN ??
  getStoredToken()

if (!token && !dryRun) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-hero-banners.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET. Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// Find the homepage doc and the Houdini legend's main image asset
const [homepage, houdini] = await Promise.all([
  client.fetch('*[_type == "homepage" && !(_id in path("drafts.**"))][0]{ _id, "hasBanners": defined(heroBannere) }'),
  client.fetch('*[_type == "legend" && slug.current == "houdini"][0]{ "imageRef": mainImage.asset._ref, "alt": mainImage.alt }'),
])

if (!homepage?._id) {
  console.error('❌ Fant ikke homepage-dokumentet i datasettet.')
  process.exit(1)
}

const houdiniImage = houdini?.imageRef
  ? {
      _type: 'image',
      asset: { _type: 'reference', _ref: houdini.imageRef },
      alt: houdini.alt ?? 'Houdini',
    }
  : undefined

// Mirrors fallbackBanners in web/src/pages/index.astro — keep in sync.
const banners = [
  {
    _key: 'houdini',
    tekstLinje1: 'Houdini',
    tekstLinje2: 'Mannen ingen lenker kunne holde',
    knappLabel: 'Se utstillingen',
    href: '/utstillingen/houdini',
    ...(houdiniImage ? { bilde: houdiniImage } : {}),
  },
  {
    _key: 'barn',
    tekstLinje1: 'Magi for barn',
    tekstLinje2: 'Ta på, prøv selv — magi du kan oppleve med hendene',
    knappLabel: 'Utforsk barnesiden',
    href: '/barn',
  },
  {
    _key: 'aktiviteter',
    tekstLinje1: 'Tryllekurs og arrangementer',
    tekstLinje2: 'Lær triks som imponerer — kurs for barn fra 6 år',
    knappLabel: 'Se hva som skjer',
    href: '/aktiviteter',
  },
  {
    _key: 'tryllehistorie',
    tekstLinje1: '4000 år med magi',
    tekstLinje2: 'Fra faraoens hoff til norske scener',
    knappLabel: 'Utforsk historien',
    href: '/tryllehistorie',
  },
  {
    _key: 'hvem-er-hvem',
    tekstLinje1: 'Magiens hvem er hvem',
    tekstLinje2: 'Norske tryllekunstnere fra A til Å',
    knappLabel: 'Bla i registeret',
    href: '/tryllehistorie/magiens-hvem-er-hvem',
  },
]

console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)
console.log(`Homepage-dokument: ${homepage._id}${homepage.hasBanners ? ' — har allerede heroBannere, hopper over (setIfMissing)' : ''}`)
console.log(`Houdini-bilde: ${houdiniImage ? houdini.imageRef : 'ikke funnet — banneret opprettes uten bilde'}`)

if (dryRun) {
  for (const b of banners) {
    console.log(`  ville lagt inn: «${b.tekstLinje1}» / «${b.tekstLinje2}» → ${b.href}${b.bilde ? ' (med bilde)' : ''}`)
  }
} else {
  await client.patch(homepage._id).setIfMissing({ heroBannere: banners }).commit()
  console.log(`✔ heroBannere lagt inn på ${homepage._id} i «${dataset}».`)
  console.log('  Last opp bilde/video på hvert banner i Studio under «Forside» → «Hero-bannere».')
  const draft = await client.fetch('*[_id == "drafts." + $id][0]._id', { id: homepage._id })
  if (draft) {
    console.log('⚠️  Det finnes en kladd (draft) av forsiden i Studio — publiser eller forkast den,')
    console.log('    ellers vises ikke de nye bannerne i Studio-skjemaet før kladden er borte.')
  }
}
