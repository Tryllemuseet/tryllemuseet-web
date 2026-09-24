import { defineField, defineType } from 'sanity'
import { richBlockContent } from './richBlockContent'

export const kursPage = defineType({
  name: 'kursPage',
  title: 'Tryllekurs',
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

    // ─── OM KURSET ────────────────────────────────────────────────
    defineField({
      name: 'omKurset',
      title: 'Om kurset',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst',   title: 'Brødtekst',  type: 'array', of: richBlockContent() }),
      ],
    }),

    // ─── DETALJER ─────────────────────────────────────────────────
    defineField({
      name: 'detaljer',
      title: 'Praktiske detaljer',
      description: 'Kort liste, f.eks. aldersgrupper, antall plasser, hva som er inkludert.',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    // ─── PRIS ─────────────────────────────────────────────────────
    defineField({
      name: 'pris',
      title: 'Pris',
      type: 'object',
      fields: [
        defineField({ name: 'belop', title: 'Beløp', type: 'string', description: 'F.eks. «kr 50»' }),
        defineField({ name: 'label', title: 'Label',  type: 'string', description: 'F.eks. «per kurs»' }),
      ],
    }),

    defineField({
      name: 'fondsBadge',
      title: 'Støttet av (badge)',
      type: 'string',
      description: 'F.eks. «Støttet av Sparebankstiftelsen DNB». La stå tom for å skjule badgen.',
    }),

    // ─── SITAT ────────────────────────────────────────────────────
    defineField({
      name: 'sitat',
      title: 'Sitat',
      type: 'object',
      fields: [
        defineField({ name: 'tekst', title: 'Sitatekst', type: 'text', rows: 2 }),
        defineField({ name: 'kilde', title: 'Kilde',      type: 'string' }),
      ],
    }),

    // ─── PÅMELDING ────────────────────────────────────────────────
    defineField({
      name: 'pamelding',
      title: 'Påmelding',
      type: 'object',
      fields: [
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref',  title: 'Knapp — URL',   type: 'string', description: 'Kan peke til en ekstern påmeldingsside.' }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Tryllekurs' }),
  },
})
