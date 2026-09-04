// schemaTypes/aktiviteterPage.ts
//
// Hub-forside for «Hva skjer» (/aktiviteter). Samme mønster som
// tryllehistoriePage.ts: hero + håndkuraterte seksjonskort. Selve
// kalenderlisten på /aktiviteter (arrangementer fra Sanity + Magiske
// Cirkel Norges iCal-feed) styres ikke herfra — det er uendret,
// dokument-uavhengig funksjonalitet i web/src/pages/aktiviteter/index.astro.
import { defineField, defineType } from 'sanity'

export const aktiviteterPage = defineType({
  name: 'aktiviteterPage',
  title: 'Aktiviteter (Hva skjer)',
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
      description: 'Håndkuraterte kort til underområder av «Hva skjer» (f.eks. Tryllekurs, Bestill tryllekunstner). Underområder som ikke har et kort her vises automatisk i en enklere liste lenger ned på siden, hentet fra Sitenavigasjon.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'emoji',  title: 'Emoji-ikon',      type: 'string' }),
          defineField({ name: 'title',  title: 'Tittel',          type: 'string', validation: R => R.required() }),
          defineField({ name: 'sub',    title: 'Underoverskrift', type: 'string' }),
          defineField({ name: 'desc',   title: 'Beskrivelse',     type: 'text', rows: 3 }),
          defineField({ name: 'badge',  title: 'Badge-tekst',     type: 'string' }),
          defineField({ name: 'href',   title: 'Lenke (URL)',     type: 'string', description: 'Intern URL, f.eks. /aktiviteter/kurs' }),
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

  ],

  preview: {
    prepare: () => ({ title: 'Aktiviteter (Hva skjer)' }),
  },
})
