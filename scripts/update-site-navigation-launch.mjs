/**
 * update-site-navigation-launch.mjs
 *
 * Content-only launch-readiness update to the existing `siteNavigation`
 * singleton (see docs/tryllemuseet_lanseringsforbedringer_ai.md, sections 3
 * and 4):
 *
 *   1. Rename the "Aktiviteter" main nav label to "Hva skjer" (the URL
 *      /aktiviteter, matchPaths, and subAreas are unchanged).
 *   2. Fold the "Opptredener" top-level nav column (Got Talent, Fool Us,
 *      Historiske opptak) into Arkivet's subAreas, in the order requested by
 *      the doc, and drop the now-empty "Opptredener" main area.
 *
 * No URLs change, no documents are deleted, no schema changes — this only
 * patches label/mainAreas fields on the one singleton doc. Mirrors the
 * DEFAULT_MAIN_AREAS fallback in web/src/lib/sanity.ts, which was updated in
 * the same change.
 *
 * Targets the PRODUCTION dataset by default (this is the only dataset that
 * exists in this project — see CLAUDE.md, July 2026 note). Pass --dry-run to
 * only print the patch without writing.
 *
 * Usage:
 *   node scripts/update-site-navigation-launch.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/update-site-navigation-launch.mjs')
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

const mainAreas = [
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
    _key: 'aktiviteter', label: 'Hva skjer', link: '/aktiviteter',
    matchPaths: ['/aktiviteter', '/arrangementer', '/barn', '/tryllequiz', '/det-trettende-kabinett'],
    column: 'left', isVisible: true,
    subAreas: [
      { _key: 'a1', label: 'Oversikt',               link: '/aktiviteter',                 isVisible: true, featureFlag: 'none' },
      { _key: 'a2', label: 'Barn & unge',             link: '/barn',                        isVisible: true, featureFlag: 'none' },
      { _key: 'a3', label: 'Tryllequiz',              link: '/tryllequiz',                  isVisible: true, featureFlag: 'quiz' },
      { _key: 'a4', label: 'Det trettende kabinett',  link: '/det-trettende-kabinett',      isVisible: false, featureFlag: 'game' },
      { _key: 'a5', label: 'Bestill tryllekunstner',  link: '/aktiviteter/tryllekunstnere', isVisible: true, featureFlag: 'none' },
    ],
  },
  {
    _key: 'arkivet', label: 'Arkivet', link: '/tryllehistorie',
    matchPaths: ['/tryllehistorie', '/ressurser'],
    column: 'right', isVisible: true,
    subAreas: [
      { _key: 'ar1', label: 'Hvem er hvem',           link: '/tryllehistorie/magiens-hvem-er-hvem', isVisible: true, featureFlag: 'none' },
      { _key: 'ar2', label: 'Fordypninger',           link: '/tryllehistorie/fordypninger',         isVisible: true, featureFlag: 'none' },
      { _key: 'ar3', label: 'Hvem skulle trodd?',     link: '/tryllehistorie/hvem-skulle-trodd',    isVisible: true, featureFlag: 'none' },
      { _key: 'ar4', label: 'Historiske artikler',    link: '/tryllehistorie/historiske-artikler',  isVisible: true, featureFlag: 'none' },
      { _key: 'ar9', label: 'Historiske opptak',      link: '/tryllehistorie/historiske-opptak',    isVisible: true, featureFlag: 'none' },
      { _key: 'ar10', label: 'Got Talent',            link: '/tryllehistorie/got-talent',           isVisible: true, featureFlag: 'none' },
      { _key: 'ar11', label: 'Penn & Teller: Fool Us', link: '/tryllehistorie/fool-us',              isVisible: true, featureFlag: 'none' },
      { _key: 'ar5', label: 'Verdens mest…',          link: '/tryllehistorie/verdens-mest',         isVisible: true, featureFlag: 'none' },
      { _key: 'ar6', label: 'Norden i FISM',          link: '/tryllehistorie/norden-i-fism',        isVisible: true, featureFlag: 'none' },
      { _key: 'ar7', label: 'Bibliotek',              link: '/ressurser/bibliotek',                 isVisible: true, featureFlag: 'none' },
      { _key: 'ar8', label: 'Ressurser',              link: '/ressurser',                           isVisible: true, featureFlag: 'none' },
    ],
  },
  {
    _key: 'om-oss', label: 'Om oss', link: '/om-oss', matchPaths: ['/om-oss'], column: 'right', isVisible: true,
    subAreas: [
      { _key: 'oo1', label: 'Om museet', link: '/om-oss',         isVisible: true, featureFlag: 'none' },
      { _key: 'oo2', label: 'I media',   link: '/om-oss/i-media', isVisible: true, featureFlag: 'none' },
    ],
  },
]

if (dryRun) {
  console.log('🔍 DRY RUN — ville ha satt mainAreas til:')
  console.log(JSON.stringify(mainAreas, null, 2))
  process.exit(0)
}

const result = await client.patch('siteNavigation').set({ mainAreas }).commit()
console.log(`✅ Oppdatert siteNavigation (dataset: ${dataset}), _rev: ${result._rev}`)
