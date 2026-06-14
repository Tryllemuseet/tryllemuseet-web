import { defineField, defineType } from 'sanity'

export const personvernPage = defineType({
  name: 'personvernPage',
  title: 'Personvernside',
  type: 'document',
  __experimental_actions: ['update', 'publish'],

  fields: [

    defineField({
      name: 'lastUpdated',
      title: 'Sist oppdatert',
      type: 'date',
      description: 'Datoen som vises øverst på personvernsiden.',
    }),

    defineField({
      name: 'intro',
      title: 'Introduksjonstekst',
      type: 'text',
      rows: 3,
      description: 'Kort innledning øverst på siden, over seksjonene.',
    }),

    defineField({
      name: 'sections',
      title: 'Seksjoner',
      type: 'array',
      description: 'Legg til, fjern eller flytt seksjoner fritt.',
      of: [{
        type: 'object',
        name: 'personvernSection',
        title: 'Seksjon',
        fields: [
          defineField({
            name: 'heading',
            title: 'Overskrift',
            type: 'string',
            validation: R => R.required(),
          }),
          defineField({
            name: 'body',
            title: 'Innhold',
            type: 'array',
            of: [{ type: 'block' }],
          }),
        ],
        preview: { select: { title: 'heading' } },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Personvernside' }),
  },
})
