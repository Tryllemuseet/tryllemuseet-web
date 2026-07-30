/**
 * seed-youtube-sources.mjs
 *
 * Creates the initial `youtubeSource` document for the Egelos channel that
 * importYouTubeClips.mjs previously had hardcoded. Run once after deploying
 * the youtubeSource schema type — after that, add further channels directly
 * in Studio.
 *
 * Idempotent: uses a deterministic _id (youtubesource-egelos) and
 * createIfNotExists, so re-running is a no-op once the document exists.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/seed-youtube-sources.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/seed-youtube-sources.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppretter youtubeSource-dokument). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const doc = {
  _id: 'youtubesource-egelos',
  _type: 'youtubeSource',
  isActive: true,
  name: 'Egelos videosamling',
  channelId: 'UCZnMLahgXe6-CDXSUnQWy7A',
  channelHandle: '@Egelosvideosamling',
  sourceLabel: 'Egelos videosamling (@Egelosvideosamling)',
}

if (dryRun) {
  console.log('[dry-run] ville opprettet:', doc)
  process.exit(0)
}

const existing = await client.fetch(`*[_id == $id][0]{_id}`, { id: doc._id })
if (existing) {
  console.log(`✓ ${doc._id} finnes allerede — ingen endring.`)
} else {
  await client.createIfNotExists(doc)
  console.log(`✓ Opprettet ${doc._id}.`)
}
