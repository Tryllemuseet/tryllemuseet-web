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
      name: 'source',
      title: 'Kilde',
      type: 'reference',
      to: [{ type: 'source' }],
      description:
        'Peker foreløpig mot «source-magiens-hvem-er-hvem-terje-nordheim-2005» — dette source-dokumentet finnes ikke ennå og må opprettes med nøyaktig denne _id-en før referansen kan løses.',
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
    select: { title: 'title' },
    prepare({ title }: { title?: string }) {
      return { title: title ?? '(uten tittel)' }
    },
  },
})
