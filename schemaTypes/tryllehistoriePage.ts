import { defineField, defineType } from 'sanity'

export const tryllehistoriePage = defineType({
  name: 'tryllehistoriePage',
  title: 'Tryllehistorie',
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

    // ─── SEKSJONER ────────────────────────────────────────────────
    defineField({
      name: 'seksjoner',
      title: 'Seksjonskort',
      type: 'array',
      description: 'Kortene som vises i rutenettet. Rekkefølgen bestemmes av listen her.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'emoji',  title: 'Emoji-ikon',      type: 'string' }),
          defineField({ name: 'title',  title: 'Tittel',          type: 'string', validation: R => R.required() }),
          defineField({ name: 'sub',    title: 'Underoverskrift', type: 'string' }),
          defineField({ name: 'desc',   title: 'Beskrivelse',     type: 'text', rows: 3 }),
          defineField({ name: 'badge',  title: 'Badge-tekst',     type: 'string', description: 'For kjente arkivsider (Hvem er hvem, legender, TV-arkivene, opptak, artikler, utstillingen) telles antallet automatisk ved bygging og overstyrer dette feltet. Brukes som den er ellers — f.eks. «Kommer snart» eller «Artikkel».' }),
          defineField({ name: 'href',   title: 'Lenke (URL)',     type: 'string', description: 'Intern URL, f.eks. /tryllehistorie/norske-legender' }),
          defineField({
            name: 'soon',
            title: 'Kommer snart (deaktiver kortet)',
            type: 'boolean',
            initialValue: false,
          }),
        ],
        preview: {
          select: { title: 'title', subtitle: 'badge', soon: 'soon' },
          prepare({ title, subtitle, soon }: { title?: string; subtitle?: string; soon?: boolean }) {
            return {
              title:    (soon ? '🔒 ' : '') + (title ?? '(uten tittel)'),
              subtitle: subtitle ?? '',
            }
          },
        },
      }],
    }),

    // ─── TIDSLINJE ────────────────────────────────────────────────
    defineField({
      name: 'tidslinjeHeading',
      title: 'Tidslinje — overskrift',
      type: 'string',
    }),
    defineField({
      name: 'tidslinje',
      title: 'Tidslinje',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'aar',
            title: 'År / periode',
            type: 'string',
            description: 'F.eks. «1845» eller «ca. 2000 f.Kr.» eller «I dag»',
            validation: R => R.required(),
          }),
          defineField({
            name: 'hendelse',
            title: 'Hendelse',
            type: 'text',
            rows: 2,
            validation: R => R.required(),
          }),
          defineField({
            name: 'siste',
            title: 'Siste element (annen visuell stil)',
            type: 'boolean',
            initialValue: false,
          }),
        ],
        preview: { select: { title: 'aar', subtitle: 'hendelse' } },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Tryllehistorie' }),
  },
})
