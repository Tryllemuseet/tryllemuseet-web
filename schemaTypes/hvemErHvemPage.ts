import { defineField, defineType } from 'sanity'
import { richBlockContent } from './richBlockContent'

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

    // ─── KILDE-NOTICE (infoboks under søkefeltet) ──────────────────
    defineField({
      name: 'kildeNotice',
      title: 'Om kilden (infoboks under søkefeltet)',
      type: 'array',
      of: richBlockContent(),
      description: 'Vises i den gule infoboksen rett under søkefeltet. Merk ordet/teksten du vil skal lenke videre (f.eks. «Ta kontakt med oss») og bruk «Ekstern lenke» for å sette eller endre lenkemålet — f.eks. /kontakt.',
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Magiens Hvem er Hvem' }),
  },
})
