import { defineField, defineType } from 'sanity'

export const hvemErHvemPage = defineType({
  name: 'hvemErHvemPage',
  title: 'Magiens Hvem er Hvem',
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
        defineField({
          name: 'ingress',
          title: 'Ingress',
          type: 'text',
          rows: 2,
          description: 'Bruk «{{antall}}» der antallet registrerte tryllekunstnere skal settes inn automatisk.',
        }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Magiens Hvem er Hvem' }),
  },
})
