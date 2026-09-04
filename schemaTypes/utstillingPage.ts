import { defineField, defineType } from 'sanity'

export const utstillingPage = defineType({
  name: 'utstillingPage',
  title: 'Utstillingen',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO ─────────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'eraLabel', title: 'Era-label (f.eks. «1845 – 1930»)', type: 'string' }),
        defineField({ name: 'heading',  title: 'Overskrift',                         type: 'string' }),
        defineField({ name: 'ingress',  title: 'Ingress',                            type: 'text', rows: 3 }),
      ],
    }),

    // ─── KOMMENDE SEKSJONER ───────────────────────────────────────
    defineField({
      name: 'kommerSnartSeksjon',
      title: '«I utstillingen»-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'label',   title: 'Label',      type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
      ],
    }),
    defineField({
      name: 'seksjoner',
      title: 'Seksjonskort',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'icon',        title: 'Emoji-ikon',    type: 'string' }),
          defineField({ name: 'label',       title: 'Label',         type: 'string' }),
          defineField({ name: 'title',       title: 'Tittel',        type: 'string', validation: R => R.required() }),
          defineField({ name: 'description', title: 'Beskrivelse',   type: 'text', rows: 2 }),
          defineField({ name: 'slug',        title: 'URL-slug',      type: 'string', description: 'F.eks. «norske-legender» → /utstillingen/norske-legender' }),
          defineField({ name: 'ready',       title: 'Tilgjengelig (vis lenke)', type: 'boolean', initialValue: false }),
          defineField({
            name: 'showAsComingSoon',
            title: 'Vis som «Kommer snart» i produksjon',
            type: 'boolean',
            initialValue: false,
            description: 'Uferdig innhold (ready = av) vises som hovedregel ikke på tryllemuseet.no i det hele tatt, kun i forhåndsvisning/staging. Slå på denne for å likevel annonsere akkurat dette kortet i produksjon, med «Kommer snart»-merket og uten lenke.',
          }),
        ],
        preview: {
          select: { title: 'title', subtitle: 'description', ready: 'ready' },
          prepare({ title, subtitle, ready }: { title?: string; subtitle?: string; ready?: boolean }) {
            return {
              title:    (ready ? '✅ ' : '🔒 ') + (title ?? '(uten tittel)'),
              subtitle: subtitle ?? '',
            }
          },
        },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Utstillingen' }),
  },
})
