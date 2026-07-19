import { defineField, defineType } from 'sanity'

export const tryllebutikkenPage = defineType({
  name: 'tryllebutikkenPage',
  title: 'Tryllebutikken',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  description: 'Innhold på /utstillingen/tryllebutikken. Opprett bare ett dokument av denne typen.',
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

    // ─── PRODUKTKATEGORIER ────────────────────────────────────────
    defineField({
      name: 'kategorier',
      title: 'Produktkategorier',
      type: 'array',
      description: 'Én seksjon per produktkategori (f.eks. Trylleposer, Triks og rekvisita, Bøker).',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'emoji',    title: 'Emoji-ikon', type: 'string' }),
          defineField({ name: 'tittel',   title: 'Tittel',     type: 'string', validation: R => R.required() }),
          defineField({ name: 'ingress',  title: 'Ingress (valgfri)', type: 'text', rows: 2 }),
          defineField({
            name: 'layout',
            title: 'Listelayout',
            type: 'string',
            options: { list: [{ title: 'Enkel liste', value: 'liste' }, { title: 'Rutenett (2 kolonner)', value: 'grid' }] },
            initialValue: 'liste',
          }),
          defineField({
            name: 'produkter',
            title: 'Produkter',
            type: 'array',
            of: [{ type: 'string' }],
          }),
        ],
        preview: {
          select: { title: 'tittel', produkter: 'produkter' },
          prepare({ title, produkter }: { title?: string; produkter?: string[] }) {
            return { title: title ?? '(uten tittel)', subtitle: `${produkter?.length ?? 0} produkter` }
          },
        },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Tryllebutikken' }),
  },
})
