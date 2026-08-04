import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

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
})
