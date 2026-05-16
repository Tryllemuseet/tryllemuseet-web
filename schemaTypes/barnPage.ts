// schemaTypes/barnPage.ts
import { defineField, defineType } from 'sanity'

export const barnPage = defineType({
  name: 'barnPage',
  title: 'Barn & unge',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO ───────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label over overskrift', type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'headingEm', title: 'Kursiv del av overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 3 }),
        defineField({ name: 'cta1Label', title: 'Knapp 1 — tekst', type: 'string' }),
        defineField({ name: 'cta1Href', title: 'Knapp 1 — URL', type: 'string' }),
        defineField({ name: 'cta2Label', title: 'Knapp 2 — tekst', type: 'string' }),
        defineField({ name: 'cta2Href', title: 'Knapp 2 — URL', type: 'string' }),
      ],
    }),

    // ─── ALDERSGRUPPER ──────────────────────────────────────────
    defineField({
      name: 'aldersgrupper',
      title: 'Aldersgrupper',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'alder', title: 'Aldersgruppe', type: 'string' }),
          defineField({ name: 'ikon', title: 'Emoji-ikon', type: 'string' }),
          defineField({ name: 'tekst', title: 'Beskrivelse', type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'alder', subtitle: 'tekst' } },
      }],
    }),

    // ─── AKTIVITETER ────────────────────────────────────────────
    defineField({
      name: 'aktiviteter',
      title: 'Aktiviteter',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'tittel', title: 'Tittel', type: 'string' }),
          defineField({ name: 'beskrivelse', title: 'Beskrivelse', type: 'text', rows: 3 }),
          defineField({ name: 'ikon', title: 'Emoji-ikon', type: 'string' }),
        ],
        preview: { select: { title: 'tittel', subtitle: 'beskrivelse' } },
      }],
    }),

    // ─── SKOLEBESØK ─────────────────────────────────────────────
    defineField({
      name: 'skolebesok',
      title: 'Skolebesøk-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 4 }),
        defineField({
          name: 'detaljer',
          title: 'Praktiske detaljer',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

    // ─── KURSBANNER ─────────────────────────────────────────────
    defineField({
      name: 'kursBanner',
      title: 'Kurs-banner',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 3 }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Barn & unge' }),
  },
})
