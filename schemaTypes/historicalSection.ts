// schemaTypes/historicalSection.ts
// Sideoverskriftene fra kildematerialet (Formenn/presidenter, Æresmedlemmer,
// NM-vinnere, osv.)

import { defineType, defineField } from 'sanity'
import { richBlockContent } from './richBlockContent'

export const historicalSection = defineType({
  name: 'historicalSection',
  title: 'Historisk seksjon',
  type: 'document',
  icon: () => '📜',
  orderings: [{ title: 'Rekkefølge', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  fields: [
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'introText',
      title: 'Beskrivende tekst',
      type: 'array',
      of: richBlockContent(),
    }),
    defineField({
      name: 'footnote',
      title: 'Fotnote',
      type: 'text',
      rows: 3,
      description: 'Vises under tabellen, f.eks. «Det ble ikke arrangert NM i 1992, 1995, 1997 og 1998.»',
    }),
    defineField({
      name: 'source',
      title: 'Kilde',
      type: 'reference',
      to: [{ type: 'source' }],
      description: 'Standard: «Mystikk som underholdning» (Nordheim & Berthelsen).',
      initialValue: { _ref: 'source-magiens-hvem-er-hvem-terje-nordheim-2005' },
    }),
    defineField({
      name: 'relatedOrganization',
      title: 'Tilknyttet organisasjon',
      type: 'reference',
      to: [{ type: 'magicOrganization' }],
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare({ title, order }: { title?: string; order?: number }) {
      return { title: title ?? '(uten tittel)', subtitle: order != null ? `Nr. ${order}` : undefined }
    },
  },
})
