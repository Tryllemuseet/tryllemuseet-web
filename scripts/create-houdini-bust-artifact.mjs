/**
 * create-houdini-bust-artifact.mjs
 *
 * Creates one `artifact` document for the new 3D-printed Houdini bust added
 * to the Houdini corner exhibit in autumn 2026. Unlike the four props added
 * in scripts/create-houdini-loan-artifacts.mjs, this is NOT a loan from Jan
 * Krosby and is NOT a historical object — it's a modern display piece the
 * museum had 3D-printed, and is marked ownerType: "museum" accordingly.
 * Both the adult and child-facing text are explicit that it's a modern,
 * non-authentic reproduction (no gold, no age), purely decorative.
 *
 * Like the other Houdini artifact script, this creates the document without
 * images — mainImage/gallery are added separately once photos are uploaded
 * as Sanity assets (see the image-upload step run alongside this task).
 *
 * If a `tema` document with slug "harry-houdini" exists, the bust is also
 * appended to its `content` array (as an `artifactRef`) so it surfaces on
 * the Houdini hub page, same as the four loan artifacts.
 *
 * Safe to run multiple times — uses createOrReplace with a fixed _id, and
 * only appends to the Tema's content array if not already present.
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/create-houdini-bust-artifact.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/create-houdini-bust-artifact.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

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

const token = process.env.SANITY_API_TOKEN ?? process.env.SANITY_TOKEN ?? getStoredToken()

if (!token) {
  console.error('❌ Mangler skrive-token.')
  console.error('   Kjør: npx sanity login')
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/create-houdini-bust-artifact.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (kun nytt dokument/referanse, ingenting eksisterende slettes). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// ── Portable text-hjelpere ──────────────────────────────────────────
let keyCounter = 0
const key = () => `k${(keyCounter++).toString(36)}`
const span = (text, marks = []) => ({ _type: 'span', _key: key(), text, marks })
const block = (children, opts = {}) => ({
  _type: 'block',
  _key: key(),
  style: opts.style ?? 'normal',
  markDefs: [],
  children,
})
const p = text => block([span(text)])

const BUST_ID = 'artifact-houdini-byste-3d-printet'

async function run() {
  console.log(`Dataset: ${dataset}`)

  await client.createOrReplace({
    _id: BUST_ID,
    _type: 'artifact',
    isVisible: true,
    title: 'Houdini-byste (3D-printet)',
    slug: { _type: 'slug', current: 'houdini-byste' },
    description:
      'En moderne 3D-printet byste av Harry Houdini, laget spesielt til utstillingen høsten 2026. Ikke en autentisk historisk gjenstand.',
    ownerType: 'museum',
    category: 'annet',
    yearNote: '2026 (moderne reproduksjon)',
    material: '3D-printet materiale',
    notes: [
      p('Denne bysten av Harry Houdini er 3D-printet og laget spesielt for utstillingen — den er ikke et historisk objekt, og har ingen tilknytning til Houdini selv eller hans samtid. Den er ment som et blikkfang og en påminnelse om hvem utstillingen handler om, ikke som et autentisk museumsobjekt.'),
      p('Overflaten har en bronse-/gullaktig finish, men bysten inneholder verken edelmetall eller andre verdifulle materialer.'),
    ],
    childText:
      'Denne bysten av Houdini er ikke ekte gammel eller laget av gull — den er printet ut av en 3D-skriver, akkurat som en avansert plastleke!',
    tags: ['houdini', 'utstillingsdekor'],
  })

  console.log(`✔ Artefakt opprettet: "Houdini-byste (3D-printet)" (${BUST_ID}) — /utstillingen/artefakter/houdini-byste`)
  console.log('')
  console.log('ℹ️  Ingen bilder er lagt til ennå — legges til i et eget steg.')

  // ── Koble til Houdini-temaet, hvis det finnes ──────────────────────
  const temaDoc = await client.fetch(`*[_type == "tema" && slug.current == "harry-houdini"][0]{ _id, content }`)

  if (!temaDoc) {
    console.log('')
    console.log('⚠️  Fant ikke tema-dokumentet med slug "harry-houdini" — hopper over kobling til Houdini-hub-siden.')
    return
  }

  const alreadyLinked = (temaDoc.content ?? []).some(c => c._ref === BUST_ID)
  if (alreadyLinked) {
    console.log('')
    console.log('✔ Bysten er allerede koblet til tema-houdini.')
    return
  }

  await client
    .patch(temaDoc._id)
    .setIfMissing({ content: [] })
    .append('content', [{ _type: 'artifactRef', _key: 'artifact-houdini-byste', _ref: BUST_ID }])
    .commit()
  console.log('')
  console.log(`✔ La til bysten i tema-houdini (${temaDoc._id}) — vises nå på /utstillingen/harry-houdini.`)
}

run().catch(err => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
