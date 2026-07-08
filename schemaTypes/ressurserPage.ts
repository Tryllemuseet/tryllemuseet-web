import { defineField, defineType } from 'sanity'

export const ressurserPage = defineType({
  name: 'ressurserPage',
  title: 'Ressurser',
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

    // ─── RESSURSER ────────────────────────────────────────────────
    defineField({
      name: 'ressurser',
      title: 'Ressurskort',
      type: 'array',
      description: 'Kort uten «Kommer snart» vises under «Tilgjengelig nå». Rekkefølgen styres av listen.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'emoji',      title: 'Emoji-ikon',  type: 'string' }),
          defineField({ name: 'title',      title: 'Tittel',      type: 'string', validation: R => R.required() }),
          defineField({ name: 'beskrivelse', title: 'Beskrivelse', type: 'text', rows: 2, validation: R => R.required() }),
          defineField({
            name: 'href',
            title: 'URL',
            type: 'string',
            description: 'Intern URL (f.eks. /ressurser/bibliotek) eller ekstern URL (https://...). Ekstern åpnes i ny fane automatisk.',
          }),
          defineField({
            name: 'soon',
            title: 'Kommer snart (deaktiver kortet)',
            type: 'boolean',
            initialValue: false,
          }),
        ],
        preview: {
          select: { title: 'title', subtitle: 'beskrivelse', soon: 'soon' },
          prepare({ title, subtitle, soon }: { title?: string; subtitle?: string; soon?: boolean }) {
            return {
              title:    (soon ? '🔒 ' : '✅ ') + (title ?? '(uten tittel)'),
              subtitle: subtitle ?? '',
            }
          },
        },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Ressurser' }),
  },
})
