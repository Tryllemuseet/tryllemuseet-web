/**
 * create-houdini-poster-artifacts.mjs
 *
 * Creates 3 `artifact` documents for the historical Houdini advertising
 * posters on display in the Houdini corner exhibit:
 *
 *   1. Prison Cell & Barrel Mystery ("The Jail Breaker")
 *   2. The Houdinis – Metamorphosis
 *   3. Harry Houdini – King of Cards
 *
 * These are NOT physical antique posters — per the museum, they are
 * digital reproductions printed from a US public-domain archive (old
 * enough that non-commercial reproduction is legal), so each is marked
 * ownerType: "museum" (not a loan) with text that's explicit it's a
 * reproduction rather than an original period print. Dates are
 * deliberately left unstated in the structured fields, since the exact
 * print years aren't confirmed — only well-established context (what each
 * poster advertised, roughly when in Houdini's career) is included in the
 * prose.
 *
 * Like the other Houdini artifact scripts, this creates the documents
 * without images — mainImage/gallery are added separately once photos are
 * uploaded as Sanity assets.
 *
 * If a `tema` document with slug "harry-houdini" exists, all three posters
 * are also appended to its `content` array (as `artifactRef`s) so they
 * surface on the Houdini hub page, same as the other Houdini artifacts.
 *
 * Safe to run multiple times — uses createOrReplace with fixed _ids, and
 * only appends to the Tema's content array if not already present.
 *
 * Usage (lokalt — bruker din eksisterende Sanity-innlogging):
 *   npx sanity exec scripts/create-houdini-poster-artifacts.mjs --with-user-token
 *
 * Usage (CI / uten lokal Sanity-innlogging):
 *   SANITY_API_TOKEN=<token> node scripts/create-houdini-poster-artifacts.mjs
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
  console.error('   Eller: SANITY_API_TOKEN=<token> node scripts/create-houdini-poster-artifacts.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (kun nye dokumenter/referanser, ingenting eksisterende slettes). Venter 5 sekunder...')
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
const h2 = text => block([span(text)], { style: 'h2' })

const posters = [
  {
    _id: 'artifact-houdini-plakat-prison-cell-barrel-mystery',
    title: 'Prison Cell & Barrel Mystery (plakatreproduksjon)',
    slug: 'prison-cell-and-barrel-mystery',
    description:
      'Digital reproduksjon av en historisk plakat for Houdinis rømningsnummer «Prison Cell & Barrel Mystery», der han ble låst inne i en fengselscelle og en tønne — og angivelig byttet plass på under to sekunder.',
    notes: [
      h2('Prison Cell & Barrel Mystery – «The Jail Breaker»'),
      p('Denne plakaten er en digital reproduksjon av en historisk reklameplakat for et av Harry Houdinis rømningsnumre, der han presenteres som «The Jail Breaker». Plakaten er hentet fra en amerikansk offentlig samling (public domain) og reprodusert til ikke-kommersiell bruk i utstillingen.'),
      p('Ifølge plakateksten ble Houdini spent fast og låst inne i en tønne, som igjen ble plassert i en låst fengselscelle — og byttet plass med noen utenfor cellen på under to sekunder. Det ble lovet 100 pund i belønning til enhver som kunne finne skjulte luker, paneler eller falske dører i cellen.'),
      p('Billedspråket, med røde djevler og en hvitkledd fe/engel, er typisk for datidens fargerike sirkus- og vaudeville-plakater.'),
    ],
    childText:
      'Se på plakaten! Houdini ble låst inne i en tønne som sto i en låst fengselscelle — og på under to sekunder byttet han plass med noen andre!',
  },
  {
    _id: 'artifact-houdini-plakat-metamorphosis',
    title: 'The Houdinis – Metamorphosis (plakatreproduksjon)',
    slug: 'the-houdinis-metamorphosis',
    description:
      'Digital reproduksjon av en historisk plakat for «Metamorphosis», byttetriksen Harry Houdini fremførte sammen med sin kone og scenepartner Bessie tidlig i karrieren.',
    notes: [
      h2('The Houdinis – Metamorphosis'),
      p('Denne plakaten er en digital reproduksjon av en historisk plakat som annonserte «Metamorphosis», illusjonsnummeret der Harry Houdini og hans kone og scenepartner Bessie byttet plass i løpet av sekunder — låst inne i henholdsvis en sekk og en kiste. Plakaten er hentet fra en amerikansk offentlig samling (public domain).'),
      p('Metamorphosis var et av Houdini-paret sine aller første store scenenumre, og et av numrene som gjorde dem kjent før Harry Houdini senere ble mest forbundet med sine solo-rømningskunster.'),
    ],
    childText:
      'Dette er en gammel plakat som viser Houdini og kona Bessie. De hadde et triks der de byttet plass kjempefort — det kalte de «Metamorphosis».',
  },
  {
    _id: 'artifact-houdini-plakat-king-of-cards',
    title: 'Harry Houdini – King of Cards (plakatreproduksjon)',
    slug: 'harry-houdini-king-of-cards',
    description:
      'Digital reproduksjon av en historisk plakat for «King of Cards», et av Houdinis tidlige kortmanipulasjonsnumre, før han ble verdenskjent for sine rømningskunster.',
    notes: [
      h2('Harry Houdini – King of Cards'),
      p('Denne plakaten er en digital reproduksjon av en historisk plakat som annonserte Houdini som «King of Cards» — et kortmanipulasjonsnummer fra tidlig i karrieren hans, lenge før han ble verdenskjent som rømningskunstner. Plakaten er hentet fra en amerikansk offentlig samling (public domain).'),
      p('Plakaten er trykt av National Printing & Engraving Co. i Chicago, et selskap som produserte mange av datidens sirkus- og vaudeville-plakater.'),
    ],
    childText:
      'Før Houdini ble kjent for å rømme fra låser og jern, var han flink med kortstokker! Denne plakaten kaller ham «kortenes konge».',
  },
]

async function run() {
  console.log(`Dataset: ${dataset}`)

  for (const poster of posters) {
    await client.createOrReplace({
      _id: poster._id,
      _type: 'artifact',
      isVisible: true,
      title: poster.title,
      slug: { _type: 'slug', current: poster.slug },
      description: poster.description,
      ownerType: 'museum',
      category: 'plakat',
      material: 'Digitalt trykk (reproduksjon)',
      notes: poster.notes,
      childText: poster.childText,
      tags: ['houdini', 'plakat', 'public domain'],
    })
    console.log(`✔ Artefakt opprettet: "${poster.title}" (${poster._id}) — /utstillingen/artefakter/${poster.slug}`)
  }

  console.log('')
  console.log('ℹ️  Ingen bilder er lagt til ennå — legges til i et eget steg.')

  // ── Koble til Houdini-temaet, hvis det finnes ──────────────────────
  const temaDoc = await client.fetch(`*[_type == "tema" && slug.current == "harry-houdini"][0]{ _id, content }`)

  if (!temaDoc) {
    console.log('')
    console.log('⚠️  Fant ikke tema-dokumentet med slug "harry-houdini" — hopper over kobling til Houdini-hub-siden.')
    return
  }

  const existingRefs = new Set((temaDoc.content ?? []).map(c => c._ref))
  const newRefs = posters
    .filter(poster => !existingRefs.has(poster._id))
    .map(poster => ({ _type: 'artifactRef', _key: `artifact-${poster.slug}`, _ref: poster._id }))

  if (newRefs.length === 0) {
    console.log('')
    console.log('✔ Alle tre plakatene er allerede koblet til tema-houdini.')
    return
  }

  await client.patch(temaDoc._id).setIfMissing({ content: [] }).append('content', newRefs).commit()
  console.log('')
  console.log(`✔ La til ${newRefs.length} plakat-referanse(r) i tema-houdini (${temaDoc._id}) — vises nå på /utstillingen/harry-houdini.`)
}

run().catch(err => {
  console.error('❌ Feilet:', err)
  process.exit(1)
})
