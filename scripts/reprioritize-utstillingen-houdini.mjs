/**
 * reprioritize-utstillingen-houdini.mjs
 *
 * The museum's actual physical exhibition has moved on from being framed
 * around "Gullalderen" to being Houdini-led, but /utstillingen's hero and
 * section copy still framed the whole page around "gullalderhistorie".
 * Rewrites the utstillingPage singleton's hero/gullalderSeksjon copy to lead
 * with Houdini, and drops "houdini" from fremhevedeSlugs (he already gets
 * top billing via the "Aktuell utstilling" section since he has stations —
 * leaving him in fremhevedeSlugs duplicated his card further down the page)
 * plus "john-nevil-maskelyne" (has no physicalOrder, so it never resolved
 * to an actual card — a dead reference).
 *
 * Patches both the published doc and its draft counterpart (an editor had
 * an unpublished draft open with only a reordering of the same two slugs),
 * so Studio doesn't show stale content next time someone opens it.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/reprioritize-utstillingen-houdini.mjs [--dry-run]
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_TOKEN ?? process.env.SANITY_AUTH_TOKEN

if (!token) {
  console.error('❌ Mangler SANITY_TOKEN (eller SANITY_AUTH_TOKEN). Kjør: SANITY_TOKEN=<token> node scripts/reprioritize-utstillingen-houdini.mjs')
  process.exit(1)
}

if (dataset === 'production' && !dryRun) {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET (oppdaterer utstillingPage-innhold). Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const patch = {
  hero: {
    eraLabel: '1874–1926',
    heading:  'Houdini — museets utstilling',
    ingress:  'Harry Houdini er museets aktuelle utstilling — rømningskunstneren som gjorde det umulige til underholdning, og ble et verdensomspennende fenomen. Bli med gjennom 11 stasjoner i hans liv, og møt magikerne fra tryllekunstens gullalder som fortsatt henger på veggene.',
  },
  gullalderSeksjon: {
    label:   'Gullalderen',
    heading: '🔮 Fra tryllekunstens gullalder (1875–1925)',
    ingress: 'Veggpanelene i denne salen tar deg gjennom 50 år med illusjoner, illusjonister og innovasjon — fra de første triksene i teatersalene til Houdinis spektakulære rømningsnumre.',
  },
  fremhevedeSlugs: ['robert-houdin', 'herrmann', 'kellar', 'thurston'],
}

const publishedId = await client.fetch(`*[_type == "utstillingPage" && !(_id in path("drafts.**"))][0]._id`)
if (!publishedId) {
  console.error('❌ Fant ingen publisert utstillingPage.')
  process.exit(1)
}
const draftId = `drafts.${publishedId}`
const draftExists = await client.fetch(`defined(*[_id == $id][0]._id)`, { id: draftId })

console.log('Ny hero:', JSON.stringify(patch.hero, null, 2))
console.log('Ny gullalderSeksjon:', JSON.stringify(patch.gullalderSeksjon, null, 2))
console.log('Ny fremhevedeSlugs:', JSON.stringify(patch.fremhevedeSlugs))
console.log(`\nOppdaterer: ${publishedId}${draftExists ? ` og ${draftId}` : ''}`)

if (dryRun) {
  console.log('\n--dry-run: ingen endringer skrevet.')
  process.exit(0)
}

const tx = client.transaction()
tx.patch(publishedId, p => p.set(patch))
if (draftExists) tx.patch(draftId, p => p.set(patch))
await tx.commit()

console.log('\n✅ Oppdatert.')
