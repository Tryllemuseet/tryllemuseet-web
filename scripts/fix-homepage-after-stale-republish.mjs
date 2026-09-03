/**
 * fix-homepage-after-stale-republish.mjs
 *
 * On 2026-09-03 an editor published the `homepage` document from a Sanity
 * Studio tab that had been open since before the #151/#152/#153 cleanup —
 * Studio publishes the whole document, so along with two deliberate new
 * edits (a `heroIdentitet` object, and replacing `heroBannere` with a single
 * new "Høstens tryllekurs" banner), it also resurrected every dead field
 * that #151/#152 had unset (`hero`, `infoBadges`, `omMuseet`, `kursSitat`,
 * `barnSeksjon.features`/`sitater`, `kursSeksjon.detaljer`/`pris`/
 * `prisLabel`/`fondsBadge`) and wiped `oppleveKort` back to empty (undoing
 * #153's removal of the "Barn & unge" card).
 *
 * This one-off script, confirmed field-by-field with the user, does all of
 * the following in a single patch:
 *   1. Unsets the resurrected dead fields (same list as
 *      unset-dead-homepage-fields.mjs).
 *   2. Restores `oppleveKort` to the 3-card set from #153 (Houdini/
 *      utstillingen, Aktuelt nå/Kurs, Magiens historie — Barn & unge still
 *      deliberately excluded).
 *   3. Restores `heroBannere` to all 6 banners: the original 5 (Houdini,
 *      Barn, Aktiviteter, Tryllehistorie, Hvem er hvem) plus the new
 *      "Høstens tryllekurs" video banner the editor just added, kept as-is
 *      (asset refs untouched) and placed first.
 *   4. Fixes `heroIdentitet.knappHref`, which pointed at
 *      `https://test.tryllemuseet.no/besok` (the test environment) instead
 *      of the internal `/besok` path used by every other internal link on
 *      this document — set to `/besok`, confirmed with the user.
 *
 * Does NOT touch `drafts.homepage`.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/fix-homepage-after-stale-republish.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')

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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/fix-homepage-after-stale-republish.mjs')
  process.exit(1)
}

const fieldsToUnset = [
  'hero',
  'infoBadges',
  'omMuseet',
  'kursSitat',
  'barnSeksjon.features',
  'barnSeksjon.sitater',
  'kursSeksjon.detaljer',
  'kursSeksjon.pris',
  'kursSeksjon.prisLabel',
  'kursSeksjon.fondsBadge',
]

const oppleveKort = [
  {
    _key: 'utstillingen',
    icon: '🎩',
    label: 'Utstillingen',
    title: 'Houdini og gullalderen',
    description: 'Møt magiens gullalder — fra Robert-Houdin til Houdini — i låven på Årvoll gård.',
    href: '/utstillingen',
    knappTekst: 'Se utstillingen',
  },
  {
    _key: 'aktuelt',
    icon: '✨',
    label: 'Aktuelt nå',
    title: 'Tryllekurs for barn',
    description: 'Du lærer triks som er enkle å utføre, men som virker meget imponerende. Kursene går over tre ettermiddager annenhver uke.',
    href: '/aktiviteter',
    knappTekst: 'Se kommende kurs',
  },
  {
    _key: 'historie',
    icon: '📜',
    label: 'Magiens historie',
    title: 'Fra faraoenes hoff til i dag',
    description: '4000 år med undring — fortalt gjennom mennesker, gjenstander og historier.',
    href: '/tryllehistorie',
    knappTekst: 'Utforsk historien',
  },
]

// The new banner is re-inserted verbatim (fetched live below) so its video
// asset reference is preserved exactly, rather than retyped by hand here.
const originalFiveBanners = [
  {
    _key: 'houdini',
    bilde: { _type: 'image', alt: 'Harry Houdini', asset: { _ref: 'image-2d44747a3b92e051abe0926bb235bc2154c48a0e-1052x1377-jpg', _type: 'reference' } },
    etikett: 'Høstens hovedutstilling',
    href: '/utstillingen/houdini',
    knappLabel: 'Se utstillingen',
    tekstLinje1: 'Houdini',
    tekstLinje2: 'Mannen ingen lenker kunne holde',
  },
  { _key: 'barn', href: '/barn', knappLabel: 'Utforsk barnesiden', tekstLinje1: 'Magi for barn', tekstLinje2: 'Ta på, prøv selv — magi du kan oppleve med hendene' },
  { _key: 'aktiviteter', href: '/aktiviteter', knappLabel: 'Se hva som skjer', tekstLinje1: 'Tryllekurs og arrangementer', tekstLinje2: 'Lær triks som imponerer — kurs for barn fra 6 år' },
  { _key: 'tryllehistorie', href: '/tryllehistorie', knappLabel: 'Utforsk historien', tekstLinje1: '4000 år med magi', tekstLinje2: 'Fra faraoens hoff til norske scener' },
  { _key: 'hvem-er-hvem', href: '/tryllehistorie/magiens-hvem-er-hvem', knappLabel: 'Bla i registeret', tekstLinje1: 'Magiens hvem er hvem', tekstLinje2: 'Norske tryllekunstnere fra A til Å' },
]

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (rydder opp gjenoppståtte felt, gjenoppretter oppleveKort og heroBannere, retter heroIdentitet.knappHref). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function run() {
  const doc = await client.fetch(`*[_type == "homepage" && !(_id in path("drafts.**"))][0]`)
  if (!doc?._id) {
    console.error('❌ Fant ingen publisert homepage-dokument.')
    process.exit(1)
  }

  const presentDeadFields = fieldsToUnset.filter((path) => {
    const [top, sub] = path.split('.')
    const value = sub ? doc[top]?.[sub] : doc[top]
    return value !== undefined
  })

  const newBanner = (doc.heroBannere ?? []).find(b => b.etikett === 'Høstens tryllekurs' || b.tekstLinje1 === 'Tryllekurs for barn i oktober')
  const heroBannere = newBanner ? [newBanner, ...originalFiveBanners] : originalFiveBanners

  console.log(`Fant homepage-dokument: ${doc._id}\n`)
  console.log('Gjenoppståtte felt som fjernes:')
  for (const path of presentDeadFields) console.log(`  - ${path}`)
  if (presentDeadFields.length === 0) console.log('  (ingen)')

  console.log(`\noppleveKort settes til ${oppleveKort.length} kort (uten Barn & unge).`)
  console.log(`heroBannere settes til ${heroBannere.length} bannere${newBanner ? ' (inkl. det nye "Høstens tryllekurs"-banneret, funnet på dokumentet)' : ' — ⚠️ fant IKKE det nye kurs-banneret på dokumentet, bruker kun de 5 gamle'}.`)
  console.log(`heroIdentitet.knappHref: "${doc.heroIdentitet?.knappHref}" → "/besok"`)

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  let patch = client.patch(doc._id).set({
    oppleveKort,
    heroBannere,
    'heroIdentitet.knappHref': '/besok',
  })
  if (presentDeadFields.length > 0) patch = patch.unset(presentDeadFields)
  await patch.commit()

  console.log('\n✅ Oppdatert.')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
