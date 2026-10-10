import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {PRIVATE_DOC_TYPES} from './schemaTypes/privateDoc'

export default defineConfig({
  name: 'default',
  title: 'Tryllemuseet',

  projectId: 'n2ynpgty',
  // Lar deg peke en lokal `sanity dev` mot et annet datasett (f.eks. et
  // development-datasett for skjematesting) uten å endre denne filen —
  // sett SANITY_STUDIO_DATASET i .env. Faller tilbake til production.
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Tryllesett and tryllebeskrivelser need a private ID (see
    // schemaTypes/privateDoc.ts) — only creatable from their own lists in
    // structure.ts, not from the global "+ Create" menu, and never by
    // "Duplicate", which would copy them to a public UUID.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter(t => !(PRIVATE_DOC_TYPES as readonly string[]).includes(t.templateId))
        : prev,
    actions: (prev, { schemaType }) =>
      (PRIVATE_DOC_TYPES as readonly string[]).includes(schemaType)
        ? prev.filter(a => a.action !== 'duplicate')
        : prev,
  },
})
