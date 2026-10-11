import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes, privateSchemaTypes} from './schemaTypes'
import {structure, privateStructure} from './structure'
import {PRIVATE_DOC_TYPES} from './schemaTypes/privateDoc'

const projectId = 'n2ynpgty'

// Two workspaces (switch with the menu next to the Studio title). Sanity
// requires every workspace's basePath to have the same number of segments,
// so the main one can't stay at "/".
export default defineConfig([
  {
    name: 'default',
    title: 'Tryllemuseet',
    basePath: '/production',
    projectId,
    // Lar deg peke en lokal `sanity dev` mot et annet datasett (f.eks. et
    // development-datasett for skjematesting) uten å endre denne filen —
    // sett SANITY_STUDIO_DATASET i .env. Faller tilbake til production.
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',

    plugins: [structureTool({structure}), visionTool()],

    schema: {
      types: schemaTypes,
    },
  },
  {
    // Bak teppet: tryllesett and tryllebeskrivelser for kit buyers. A PRIVATE
    // dataset, so neither the documents nor their image/file assets can be
    // queried or listed without a token (see schemaTypes/kitCollection.ts).
    // Locally, SANITY_STUDIO_PRIVATE_DATASET=development points it at the
    // sandbox instead.
    name: 'lukket',
    title: 'Bak teppet (lukket)',
    basePath: '/lukket',
    projectId,
    dataset: process.env.SANITY_STUDIO_PRIVATE_DATASET || 'lukket',

    plugins: [structureTool({structure: privateStructure}), visionTool()],

    schema: {
      types: privateSchemaTypes,
    },

    document: {
      // Tryllesett and tryllebeskrivelser keep a private ID (see
      // schemaTypes/privateDoc.ts) — only creatable from their own lists in
      // structure.ts, not from the global "+ Create" menu, and never by
      // "Duplicate", which would copy them to a plain UUID.
      newDocumentOptions: (prev, { creationContext }) =>
        creationContext.type === 'global'
          ? prev.filter(t => !(PRIVATE_DOC_TYPES as readonly string[]).includes(t.templateId))
          : prev,
      actions: (prev, { schemaType }) =>
        (PRIVATE_DOC_TYPES as readonly string[]).includes(schemaType)
          ? prev.filter(a => a.action !== 'duplicate')
          : prev,
    },
  },
])
