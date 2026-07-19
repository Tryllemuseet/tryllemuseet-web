/**
 * seed-site-navigation.mjs
 *
 * Creates the siteNavigation singleton so the "Navigasjon (header/meny)"
 * menu item in Sanity Studio actually has a document to edit. Until now the
 * header, mobile menu and footer nav ran entirely on the hardcoded array in
 * web/src/layouts/BaseLayout.astro — this script seeds that same structure
 * (main areas + their sub-areas, in the same order and columns) as the
 * initial editable document.
 *
 * Uses createIfNotExists with the fixed _id "siteNavigation" (matching the
 * singleton convention used by e.g. siteConfig/quizConfig), so re-runs never
 * overwrite content that has since been edited in Studio.
 *
 * Targets the PRODUCTION dataset by default (explicitly confirmed for this
 * content load). Override with SANITY_DATASET=development, or pass
 * --dry-run to only print what would be written.
 *
 * Usage:
 *   node scripts/seed-site-navigation.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-site-navigation.mjs')
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

// Speiler DEFAULT_MAIN_AREAS i web/src/lib/sanity.ts (getSiteNavigation) og
// den tidligere hardkodede menyen i BaseLayout.astro, som av 2026-07-19.
const doc = {
  _id: 'siteNavigation',
  _type: 'siteNavigation',
  mainAreas: [
    { _key: 'besok', label: 'Besøk oss', link: '/besok', matchPaths: ['/besok'], column: 'left', isVisible: true, subAreas: [] },
    {
      _key: 'utstillingen', label: 'Utstillingen', link: '/utstillingen', matchPaths: ['/utstillingen'], column: 'left', isVisible: true,
      subAreas: [
        { _key: 'u1', label: 'Oversikt',          link: '/utstillingen',                   isVisible: true, featureFlag: 'none' },
        { _key: 'u2', label: 'Artefakter',        link: '/utstillingen/artefakter',        isVisible: true, featureFlag: 'none' },
        { _key: 'u3', label: 'Trylleforeningene', link: '/utstillingen/trylleforeningene', isVisible: true, featureFlag: 'none' },
        { _key: 'u4', label: 'Tryllebutikken',    link: '/utstillingen/tryllebutikken',    isVisible: true, featureFlag: 'none' },
      ],
    },
    {
      _key: 'aktiviteter', label: 'Aktiviteter', link: '/aktiviteter',
      matchPaths: ['/aktiviteter', '/arrangementer', '/barn', '/tryllequiz', '/det-trettende-kabinett'],
      column: 'left', isVisible: true,
      subAreas: [
        { _key: 'a1', label: 'Oversikt',               link: '/aktiviteter',                 isVisible: true, featureFlag: 'none' },
        { _key: 'a2', label: 'Barn & unge',             link: '/barn',                        isVisible: true, featureFlag: 'none' },
        { _key: 'a3', label: 'Tryllequiz',              link: '/tryllequiz',                  isVisible: true, featureFlag: 'quiz' },
        { _key: 'a4', label: 'Det trettende kabinett',  link: '/det-trettende-kabinett',      isVisible: true, featureFlag: 'game' },
        { _key: 'a5', label: 'Bestill tryllekunstner',  link: '/aktiviteter/tryllekunstnere', isVisible: true, featureFlag: 'none' },
      ],
    },
    {
      _key: 'opptredener', label: 'Opptredener', link: '/tryllehistorie/got-talent',
      matchPaths: ['/tryllehistorie/got-talent', '/tryllehistorie/fool-us', '/tryllehistorie/historiske-opptak'],
      column: 'left', isVisible: true,
      subAreas: [
        { _key: 'o1', label: 'Got Talent',                 link: '/tryllehistorie/got-talent',        isVisible: true, featureFlag: 'none' },
        { _key: 'o2', label: 'Penn & Teller: Fool Us',      link: '/tryllehistorie/fool-us',           isVisible: true, featureFlag: 'none' },
        { _key: 'o3', label: 'Historiske opptak',           link: '/tryllehistorie/historiske-opptak', isVisible: true, featureFlag: 'none' },
      ],
    },
    {
      _key: 'arkivet', label: 'Arkivet', link: '/tryllehistorie',
      matchPaths: ['/tryllehistorie', '/ressurser'],
      column: 'right', isVisible: true,
      subAreas: [
        { _key: 'ar1', label: 'Hvem er hvem',        link: '/tryllehistorie/magiens-hvem-er-hvem', isVisible: true, featureFlag: 'none' },
        { _key: 'ar2', label: 'Fordypninger',        link: '/tryllehistorie/fordypninger',         isVisible: true, featureFlag: 'none' },
        { _key: 'ar3', label: 'Hvem skulle trodd?',  link: '/tryllehistorie/hvem-skulle-trodd',    isVisible: true, featureFlag: 'none' },
        { _key: 'ar4', label: 'Historiske artikler', link: '/tryllehistorie/historiske-artikler',  isVisible: true, featureFlag: 'none' },
        { _key: 'ar5', label: 'Verdens mest…',       link: '/tryllehistorie/verdens-mest',         isVisible: true, featureFlag: 'none' },
        { _key: 'ar6', label: 'Norden i FISM',       link: '/tryllehistorie/norden-i-fism',        isVisible: true, featureFlag: 'none' },
        { _key: 'ar7', label: 'Bibliotek',           link: '/ressurser/bibliotek',                 isVisible: true, featureFlag: 'none' },
        { _key: 'ar8', label: 'Ressurser',           link: '/ressurser',                           isVisible: true, featureFlag: 'none' },
      ],
    },
    {
      _key: 'om-oss', label: 'Om oss', link: '/om-oss', matchPaths: ['/om-oss'], column: 'right', isVisible: true,
      subAreas: [
        { _key: 'oo1', label: 'Om museet', link: '/om-oss',          isVisible: true, featureFlag: 'none' },
        { _key: 'oo2', label: 'I media',   link: '/om-oss/i-media', isVisible: true, featureFlag: 'none' },
      ],
    },
  ],
}

console.log(`Dataset: ${dataset}${dryRun ? ' (tørrkjøring — ingenting skrives)' : ''}`)

if (dryRun) {
  console.log(`  ville opprettet: ${doc._id} (${doc.mainAreas.length} hovedområder)`)
} else {
  const created = await client.createIfNotExists(doc)
  console.log(`✔ ${created._id} opprettet/uendret (publisert) i «${dataset}».`)
  console.log('  Innholdet kan nå redigeres i Studio under «Navigasjon (header/meny)».')
}
