/**
 * seed-gode-rad-config.mjs
 *
 * No published `godeRadConfig` document exists in Sanity at all (confirmed
 * via a direct GROQ query — *[_type == "godeRadConfig"] returns an empty
 * array), which is why the "Gode råd" document looks empty/missing in
 * Studio. The real content the user remembers is live on every "Lær et
 * triks" detail page (via <TriksGodeRad> → getGodeRadConfig() in
 * web/src/lib/sanity.ts) as a hardcoded fallback — it was never actually
 * missing from the site, just never created as an editable Sanity document.
 *
 * This script creates that one singleton document with exactly the
 * fallback text from getGodeRadConfig(), so it becomes visible and
 * editable in Studio without changing anything a visitor sees (the code
 * fallback and the new document contain identical text).
 *
 * Idempotent and non-destructive: if a godeRadConfig document already
 * exists (regardless of content), the script does nothing unless --force
 * is passed.
 *
 * Usage:
 *   SANITY_API_TOKEN=<token> node scripts/seed-gode-rad-config.mjs [--dry-run] [--force]
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/seed-gode-rad-config.mjs')
  process.exit(1)
}

const doc = {
  _type: 'godeRadConfig',
  barnHeading: 'Til deg som øver',
  barnRad: [
    'Øv mange ganger foran et speil, eller for en voksen du stoler på, før du viser trikset til andre.',
    'Ta deg god tid — ingen ser at et triks tar litt forberedelse.',
    'Snakk gjerne mens du gjør trikset. Det gjør det morsommere, og får publikum til å se dit du vil.',
    'Ikke vis samme triks to ganger på rad til de samme personene — da er det lettere å gjennomskue.',
    'Avslør aldri hemmeligheten selv. La heller de som ser på få lure litt!',
    'Det er helt normalt å feile mange ganger under øving — selv de beste tryllekunstnerne øvde utrolig mye før de fikk det til.',
  ],
  voksneHeading: 'Til voksne',
  voksneRad: [
    'La barnet øve i sitt eget tempo. Press for å «få det til» tar bort gleden.',
    'Noen triks bruker saks eller andre skarpe eller små gjenstander — hjelp til, og følg med underveis.',
    'Vær et godt publikum: la deg overraske, still spørsmål, og ikke avslør hvordan trikset funker selv om du skjønner det.',
    'Å lære et triks er en fin måte å øve seg på å snakke foran andre og bygge selvtillit. Ros gjerne innsatsen, ikke bare resultatet.',
  ],
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter godeRadConfig-dokumentet). Venter 5 sekunder...')
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
  const existing = await client.fetch(`*[_type == "godeRadConfig" && !(_id in path("drafts.**"))][0]{ _id }`)

  if (existing?._id && !force) {
    console.log(`⏭️  Fant allerede et godeRadConfig-dokument (${existing._id}) — hopper over for å ikke overskrive.`)
    console.log('   Bruk --force for å overskrive med teksten fra koden likevel.')
    return
  }

  console.log(existing?._id
    ? `Overskriver eksisterende dokument ${existing._id} (--force).`
    : 'Ingen godeRadConfig-dokument funnet — oppretter ett nytt.')
  console.log(`barnRad: ${doc.barnRad.length} råd, voksneRad: ${doc.voksneRad.length} råd.`)

  if (dryRun) {
    console.log('\n--dry-run: ingen endringer skrevet.')
    return
  }

  if (existing?._id) {
    await client.createOrReplace({ _id: existing._id, ...doc })
  } else {
    await client.create(doc)
  }

  console.log('\n✅ Opprettet/oppdatert.')
}

run().catch((err) => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
