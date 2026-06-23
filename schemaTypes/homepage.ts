// schemaTypes/homepage.ts
import { defineField, defineType } from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Forside',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO ───────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'headingEm', title: 'Kursiv del av overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 3 }),
        defineField({ name: 'cta1Label', title: 'Knapp 1 — tekst', type: 'string' }),
        defineField({ name: 'cta1Href', title: 'Knapp 1 — URL', type: 'string' }),
        defineField({ name: 'cta2Label', title: 'Knapp 2 — tekst', type: 'string' }),
        defineField({ name: 'cta2Href', title: 'Knapp 2 — URL', type: 'string' }),
        defineField({
          name: 'bgImage',
          title: 'Bakgrunnsbilde',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),

    // ─── INFO-BADGES ────────────────────────────────────────────
    defineField({
      name: 'infoBadges',
      title: 'Info-badges',
      description: 'Tre korte fakta under hero, f.eks. "7 Utstillingsfelt"',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Tekst', type: 'string' }),
        ],
        preview: { select: { title: 'label' } },
      }],
      validation: (R) => R.max(3),
    }),

    // ─── UTSTILLINGS-SEKSJON ────────────────────────────────────
    defineField({
      name: 'utstillingsFokus',
      title: 'Utstillings-seksjon',
      type: 'object',
      fields: [
        defineField({
          name: 'eraLabel',
          title: 'Tidsperiode-label',
          type: 'string',
          description: 'F.eks. "Gullalderen 1845–1930"',
        }),
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({
          name: 'felt',
          title: 'Håndplukkede utstillingsfelt (maks 3)',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'magician' }] }],
          validation: (R) => R.max(3),
        }),
      ],
    }),

    // ─── BARN & UNGE ────────────────────────────────────────────
    defineField({
      name: 'barnSeksjon',
      title: 'Barn & unge-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({
          name: 'features',
          title: 'Aktiviteter/features',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'sitater',
          title: 'Sitater',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'emoji', title: 'Emoji', type: 'string' }),
              defineField({ name: 'tekst', title: 'Sitatekst', type: 'text', rows: 2 }),
              defineField({ name: 'kilde', title: 'Kilde', type: 'string' }),
            ],
            preview: { select: { title: 'tekst' } },
          }],
        }),
      ],
    }),

    // ─── MEDLEMSKAP ─────────────────────────────────────────────
    defineField({
      name: 'medlemSeksjon',
      title: 'Medlemskap-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 3 }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappUrl', title: 'Knapp — URL', type: 'url' }),
      ],
    }),

    // ─── OM MUSEET ──────────────────────────────────────────────
    defineField({
      name: 'omMuseet',
      title: 'Om museet-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 4 }),
        defineField({ name: 'sitat', title: 'Sitat', type: 'text', rows: 2 }),
        defineField({ name: 'sitatKilde', title: 'Sitatets kilde', type: 'string' }),
      ],
    }),

    // ─── IBSEN-SEKSJON ──────────────────────────────────────────
    defineField({
      name: 'ibsenSeksjon',
      title: 'Ibsen-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 3 }),
        defineField({ name: 'sitat', title: 'Sitat', type: 'text', rows: 3 }),
        defineField({ name: 'sitatKilde', title: 'Sitatets kilde', type: 'string' }),
        defineField({ name: 'lenkLabel', title: 'Lenke — tekst', type: 'string' }),
        defineField({ name: 'lenkHref', title: 'Lenke — URL', type: 'string' }),
      ],
    }),

    // ─── KURS-SEKSJON ───────────────────────────────────────────
    defineField({
      name: 'kursSeksjon',
      title: 'Kurs-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({
          name: 'detaljer',
          title: 'Detaljer (kulepunkter)',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({ name: 'pris', title: 'Pris', type: 'string' }),
        defineField({ name: 'prisLabel', title: 'Prislabel', type: 'string' }),
        defineField({ name: 'fondsBadge', title: 'Fondsbadge', type: 'string' }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

    // ─── KURSSITAT ──────────────────────────────────────────────
    defineField({
      name: 'kursSitat',
      title: 'Kurssitat',
      type: 'object',
      fields: [
        defineField({ name: 'tekst', title: 'Sitatekst', type: 'text', rows: 2 }),
        defineField({ name: 'kilde', title: 'Kilde', type: 'string' }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Forside' }),
  },
})
