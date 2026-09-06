import { createClient } from '@sanity/client'
const client = createClient({
  projectId: 'n2ynpgty',
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})
const ids = ['biography-christiansen-mortenn', 'biography-brynolf-peter', 'biography-foolus-mortenn-christiansen', 'biography-foolus-brynolf-ljung']
const docs = await client.fetch(`*[_id in $ids]{_id, name, artistName, aliases}`, { ids })
console.log(JSON.stringify(docs, null, 2))
