import { defineField, defineType } from 'sanity'
import { richBlockContent } from './richBlockContent'

export const kontaktPage = defineType({
  name: 'kontaktPage',
  title: 'Kontakt oss',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO ─────────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'label',   title: 'Label over overskrift', type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift',            type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress',               type: 'text', rows: 2 }),
      ],
    }),

    // ─── SKJEMA ───────────────────────────────────────────────────
    defineField({
      name: 'skjemaUrl',
      title: 'Microsoft Forms — embed-URL',
      type: 'url',
      description: 'Lim inn embed-URL fra Microsoft Forms. Endres sjelden.',
    }),

    // ─── FAQ ──────────────────────────────────────────────────────
    defineField({
      name: 'faq',
      title: 'Ofte stilte spørsmål',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'sporsmal',
            title: 'Spørsmål',
            type: 'string',
            validation: R => R.required(),
          }),
          defineField({
            name: 'svar',
            title: 'Svar',
            type: 'array',
            of: richBlockContent(),
            validation: R => R.required(),
          }),
        ],
        preview: { select: { title: 'sporsmal', subtitle: 'svar' } },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Kontakt oss' }),
  },
})
