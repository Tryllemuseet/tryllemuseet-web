/**
 * set-homepage-opplevekort-uten-barn.mjs
 *
 * The "Dette kan du oppleve" section on the frontpage falls back to 4
 * hardcoded cards (Houdini/utstillingen, Barn & unge, Kurs, Magiens
 * historie — see web/src/pages/index.astro) whenever homepage.oppleveKort
 * is empty in Sanity. The user asked to remove the "Barn & unge" card
 * entirely (not just its heading text), which the schema already supports:
 * populating oppleveKort with any cards makes the code use ONLY those,
 * replacing the 4-card fallback wholesale.
 *
 * This sets homepage.oppleveKort to the same 3 remaining cards (Houdini,
 * Aktuelt nå/Kurs, Magiens historie), using emoji icons rather than trying
 * to reproduce the Houdini legend's image reference, and leaves the
 * "Aktuelt nå" card linking to /aktiviteter (the general courses/events
 * page) rather than reusing kursSeksjon.knappHref, which currently holds
 * "Https://kurs.tryllemuseet.no" — note the stray capital H — flagged to
 * the user separately rather than propagated here.
 *
 * Every other field on the homepage document (heroIdentitet, heroBannere,
 * fremhevetInnhold, barnSeksjon, medlemSeksjon, kursSeksjon) is untouched.
 * Does not touch `drafts.homepage`.
 *
 * Safe to run multiple times (idempotent — sets the same array).
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/set-homepage-opplevekort-uten-barn.mjs [--dry-run]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/set-homepage-opplevekort-uten-barn.mjs')
  process.exit(1)
}

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

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (setter homepage.oppleveKort til 3 kort, fjerner Barn & unge-kortet). Venter 5 sekunder...')
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
  const homepageId = await client.fetch(`*[_type == "homepage" && !(_id in path("drafts.**"))][0]._id`)
  if (!homepageId) {
    console.error('❌ Fant ingen publisert homepage-dokument.')
    process.exit(1)
  }

  const current = await client.fetch(`*[_id == $id][0].oppleveKort[]{ label, title }`, { id: homepageId })
  console.log(`Fant homepage-dokument: ${homepageId}`)
  console.log(`Nåværende oppleveKort: ${current?.length ? JSON.stringify(current) : '(tomt — bruker fallback-kortene i koden)'}`)
  console.log(`\nNytt oppleveKort (${oppleveKort.length} kort, uten Barn & unge):`)
  for (const k of oppleveKort) console.log(`  - ${k.label}: ${k.title}`)

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  await client.patch(homepageId).set({ oppleveKort }).commit()

  console.log('\n✅ Oppdatert.')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
