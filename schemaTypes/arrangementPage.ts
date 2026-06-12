import { defineField, defineType } from 'sanity'

export const arrangementPage = defineType({
  name: 'arrangementPage',
  title: 'Arrangementer',
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
        defineField({ name: 'ingress', title: 'Ingress',               type: 'text', rows: 3 }),
      ],
    }),

    // ─── INFO-STRIP ───────────────────────────────────────────────
    defineField({
      name: 'infoStrip',
      title: 'Info-strip',
      type: 'array',
      description: 'De tre informasjonsboksene under arrangementslisten.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'emoji',     title: 'Emoji-ikon', type: 'string' }),
          defineField({ name: 'heading',   title: 'Overskrift', type: 'string', validation: R => R.required() }),
          defineField({ name: 'tekst',     title: 'Brødtekst',  type: 'text', rows: 2 }),
          defineField({ name: 'linkHref',  title: 'Lenke — URL (valgfri)',   type: 'string', description: 'F.eks. /kontakt eller /besok' }),
          defineField({ name: 'linkTekst', title: 'Lenke — tekst (valgfri)', type: 'string' }),
        ],
        preview: { select: { title: 'heading', subtitle: 'tekst' } },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Arrangementer' }),
  },
})
