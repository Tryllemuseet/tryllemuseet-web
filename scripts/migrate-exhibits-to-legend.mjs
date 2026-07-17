/**
 * migrate-exhibits-to-legend.mjs
 *
 * Non-destructive migration: copies existing `magician` documents (the 7
 * Gullalderen wall panels) and `exhibitionShow` / `exhibitionStation`
 * documents (currently: Houdini) into the new, unified `legend` shape
 * (see schemaTypes/legend.ts).
 *
 * Where a magician doc and an exhibitionShow share a slug — today that's
 * Houdini, which otherwise ends up as two documents competing for one URL
 * (see the collision-handling comment in web/src/pages/utstillingen/[slug].astro)
 * — they are merged into ONE legend document: the wall-panel text plus the
 * exhibition's stations, as an inline `stations` array.
 *
 * Originals are NOT modified or deleted. Created documents are isVisible:
 * false, so nothing changes on the live site by running this script — the
 * old magician/exhibitionShow pages keep rendering exactly as before.
 *
 * Safe to run multiple times — uses createOrReplace with deterministic
 * _ids (legend-migrated-<slug>).
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/migrate-exhibits-to-legend.mjs
 *   SANITY_TOKEN=<token> SANITY_DATASET=production node scripts/migrate-exhibits-to-legend.mjs
 *
 * Hent token fra sanity.io/manage → prosjekt → API → Tokens (editor-tilgang).
 *
 * Etter kjøring — manuelt, som egne steg:
 *   1. Gjennomgå de nye dokumentene i Studio (typen heter nå "Fordypning").
 *   2. Oppdater /utstillingen- og /tryllehistorie-sidene til å lese fra legend.
 *   3. Skru på isVisible per dokument når artikkelen er verifisert.
 *   4. Fjern magician / exhibitionShow / exhibitionStation-dokumentene og
 *      -skjemaene i et eget, bevisst steg — ikke del av dette scriptet.
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'

if (!process.env.SANITY_TOKEN) {
  console.error('❌ Mangler SANITY_TOKEN. Kjør: SANITY_TOKEN=<token> node scripts/migrate-exhibits-to-legend.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter kun nye dokumenter — ingenting slettes eller endres). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// Wraps a plain string into a single-paragraph Portable Text block, for
// fields that moved from plain `text` (exhibitionShow.introAdults) to the
// portable-text `wallText` field on legend.
function toBlock(text) {
  return {
    _type: 'block',
    _key: 'wall-' + Math.random().toString(36).slice(2, 9),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'wall-s-' + Math.random().toString(36).slice(2, 9), text, marks: [] }],
  }
}

function stripUndefined(obj) {
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) delete obj[k]
    else if (Array.isArray(obj[k]) && obj[k].length === 0) delete obj[k]
  }
  return obj
}

function mapStations(stationRefs) {
  return (stationRefs ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s, i) => stripUndefined({
      _type: 'object',
      _key: s._id ?? `station-${i}`,
      title: s.title,
      order: s.order,
      year: s.year,
      image: s.image,
      textKids: s.textKids,
      textAdults: s.textAdults,
      activityPrompt: s.activityPrompt,
    }))
}

async function run() {
  console.log(`Dataset: ${dataset}`)

  const magicians = await client.fetch(`*[_type == "magician"]{
    _id, isVisible, title, "slug": slug.current, tagline, years,
    qrNumber, order,
    childText, childActivity, adultText,
    mobileIntro, mobileSections,
    posterImage, sources
  }`)
  console.log(`Fant ${magicians.length} magician-dokument(er).`)

  const shows = await client.fetch(`*[_type == "exhibitionShow"]{
    _id, isVisible, title, "slug": slug.current, subtitle,
    heroImage, introKids, introAdults, relatedMagician, sources,
    "stationRefs": stations[]->{
      _id, isVisible, title, "slug": slug.current, order, year,
      image, textKids, textAdults, activityPrompt
    }
  }`)
  console.log(`Fant ${shows.length} exhibitionShow-dokument(er).`)

  const showBySlug = new Map(shows.filter(s => s.slug).map(s => [s.slug, s]))
  const usedShowSlugs = new Set()

  const tx = client.transaction()
  let created = 0

  // 1. Magician docs — merged with a matching exhibitionShow when slugs collide
  for (const m of magicians) {
    if (!m.slug) {
      console.warn(`⚠️  Hopper over magician "${m.title}" (${m._id}) — mangler slug.`)
      continue
    }
    const show = showBySlug.get(m.slug)
    if (show) usedShowSlugs.add(m.slug)

    const doc = stripUndefined({
      _id: `legend-migrated-${m.slug}`,
      _type: 'legend',
      isVisible: false,
      title: m.title,
      slug: { _type: 'slug', current: m.slug },
      biographyRef: show?.relatedMagician,
      tagline: m.tagline ?? show?.subtitle,
      years: m.years,
      qrNumber: m.qrNumber,
      physicalOrder: m.order,
      childText: m.childText ?? show?.introKids,
      childActivity: m.childActivity,
      wallText: (m.adultText && m.adultText.length > 0)
        ? m.adultText
        : (show?.introAdults ? [toBlock(show.introAdults)] : undefined),
      detailIntro: m.mobileIntro,
      sections: m.mobileSections ?? [],
      mainImage: m.posterImage ?? show?.heroImage,
      sources: [...(m.sources ?? []), ...(show?.sources ?? [])],
      stations: mapStations(show?.stationRefs),
    })

    tx.createOrReplace(doc)
    created++
    console.log(`✔ ${doc._id}${show ? `  (slått sammen med exhibitionShow "${show.title}", ${doc.stations?.length ?? 0} stasjoner)` : ''}`)
  }

  // 2. exhibitionShow docs that did NOT collide with a magician slug
  for (const show of shows) {
    if (!show.slug || usedShowSlugs.has(show.slug)) continue

    const doc = stripUndefined({
      _id: `legend-migrated-${show.slug}`,
      _type: 'legend',
      isVisible: false,
      title: show.title,
      slug: { _type: 'slug', current: show.slug },
      biographyRef: show.relatedMagician,
      tagline: show.subtitle,
      childText: show.introKids,
      wallText: show.introAdults ? [toBlock(show.introAdults)] : undefined,
      mainImage: show.heroImage,
      sources: show.sources ?? [],
      stations: mapStations(show.stationRefs),
    })

    tx.createOrReplace(doc)
    created++
    console.log(`✔ ${doc._id}  (${doc.stations?.length ?? 0} stasjoner)`)
  }

  if (created === 0) {
    console.log('Ingen dokumenter å migrere.')
    return
  }

  await tx.commit()
  console.log('')
  console.log(`Ferdig. ${created} legend-dokument(er) opprettet (isVisible: false).`)
  console.log('Originalene (magician / exhibitionShow / exhibitionStation) er IKKE endret eller slettet.')
  console.log('Neste steg:')
  console.log('  1. Gjennomgå de nye dokumentene i Studio (typen heter nå «Fordypning»).')
  console.log('  2. Oppdater /utstillingen- og /tryllehistorie-sidene til å lese fra legend.')
  console.log('  3. Skru på isVisible per dokument når artikkelen er verifisert.')
  console.log('  4. Fjern magician/exhibitionShow/exhibitionStation-dokumentene og -skjemaene i et eget steg.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
