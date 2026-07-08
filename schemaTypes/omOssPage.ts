// schemaTypes/omOssPage.ts
import { defineField, defineType } from 'sanity'

export const omOssPage = defineType({
  name: 'omOssPage',
  title: 'Om oss',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO ───────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'headingEm', title: 'Kursiv del av overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 3 }),
      ],
    }),

    // ─── OM MUSEET ──────────────────────────────────────────────
    defineField({
      name: 'omMuseet',
      title: 'Om museet-seksjon',
      type: 'object',
      fields: [
        defineField({
          name: 'historieHeading',
          title: 'Historieoverskrift',
          type: 'string',
        }),
        defineField({
          name: 'historieTekst',
          title: 'Historietekst',
          type: 'array',
          of: [{ type: 'block' }],
        }),
        defineField({
          name: 'formalHeading',
          title: 'Formål-overskrift',
          type: 'string',
        }),
        defineField({
          name: 'formalTekst',
          title: 'Formål-tekst',
          type: 'text',
          rows: 4,
        }),
      ],
    }),

    // ─── FAKTABOKS ──────────────────────────────────────────────
    defineField({
      name: 'faktaboks',
      title: 'Faktaboks',
      type: 'object',
      fields: [
        defineField({ name: 'stiftet', title: 'Stiftet', type: 'string' }),
        defineField({ name: 'organisasjonsform', title: 'Organisasjonsform', type: 'string' }),
        defineField({ name: 'tilknytning', title: 'Tilknytning', type: 'string' }),
        defineField({
          name: 'adresse',
          title: 'Adresse',
          type: 'string',
          description: 'La stå tom for å bruke adressen fra Globale innstillinger. Fyll kun inn hvis den registrerte adressen avviker fra besøksadressen.',
        }),
        // E-post vises alltid fra Globale innstillinger (siteConfig.email).
        defineField({ name: 'orgnr', title: 'Organisasjonsnummer', type: 'string' }),
      ],
    }),

    // ─── STYRET ─────────────────────────────────────────────────
    defineField({
      name: 'styret',
      title: 'Styret',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({
          name: 'medlemmer',
          title: 'Styremedlemmer',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'navn', title: 'Navn', type: 'string' }),
              defineField({
                name: 'rolle',
                title: 'Rolle',
                type: 'string',
                options: {
                  list: [
                    { title: 'Styreleder', value: 'Styreleder' },
                    { title: 'Daglig leder', value: 'Daglig leder' },
                    { title: 'Styremedlem', value: 'Styremedlem' },
                  ],
                },
              }),
            ],
            preview: { select: { title: 'navn', subtitle: 'rolle' } },
          }],
        }),
      ],
    }),

    // ─── MEDLEMSKAP ─────────────────────────────────────────────
    defineField({
      name: 'medlemskap',
      title: 'Medlemskap-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({ name: 'motivasjonsTekst', title: 'Motivasjonstekst', type: 'text', rows: 6 }),
        defineField({
          name: 'nivaaer',
          title: 'Medlemskapsnivåer',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'type', title: 'Type', type: 'string' }),
              defineField({ name: 'pris', title: 'Pris', type: 'string' }),
              defineField({ name: 'anbefalt', title: 'Anbefalt?', type: 'boolean' }),
              defineField({
                name: 'fordeler',
                title: 'Fordeler',
                type: 'array',
                of: [{ type: 'string' }],
              }),
              defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
              defineField({ name: 'knappUrl', title: 'Knapp — URL', type: 'url' }),
            ],
            preview: { select: { title: 'type', subtitle: 'pris' } },
          }],
        }),
        // Vipps-nummeret vises alltid fra Globale innstillinger (siteConfig.vippsNumber).
        defineField({ name: 'vippsInfo', title: 'Vipps-info', type: 'string' }),
      ],
    }),

    // ─── PRESSE ─────────────────────────────────────────────────
    defineField({
      name: 'presse',
      title: 'Presse-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 4 }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

    // ─── PARTNERE ───────────────────────────────────────────────
    defineField({
      name: 'partnere',
      title: 'Samarbeidspartnere',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({
          name: 'liste',
          title: 'Partnere',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'navn', title: 'Navn', type: 'string' }),
              defineField({ name: 'beskrivelse', title: 'Beskrivelse', type: 'string' }),
              defineField({ name: 'url', title: 'URL (valgfritt)', type: 'url' }),
            ],
            preview: { select: { title: 'navn', subtitle: 'beskrivelse' } },
          }],
        }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Om oss' }),
  },
})
