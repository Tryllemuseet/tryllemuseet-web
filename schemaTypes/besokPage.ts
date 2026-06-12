import { defineField, defineType } from 'sanity'

export const besokPage = defineType({
  name: 'besokPage',
  title: 'Besøk oss',
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

    // ─── HURTIGINFO-STRIP ─────────────────────────────────────────
    defineField({
      name: 'hurtiginfo',
      title: 'Hurtiginfo-strip',
      type: 'object',
      description: 'Åpningstider og adresse hentes automatisk fra Nettstedskonfigurasjon.',
      fields: [
        defineField({
          name: 'inngangTekst',
          title: 'Inngang — tekst',
          type: 'string',
          description: 'F.eks. «Gratis inngang for alle»',
        }),
        defineField({
          name: 'forestillingerTekst',
          title: 'Forestillinger — tekst',
          type: 'string',
          description: 'F.eks. «3 pr. halvår»',
        }),
      ],
    }),

    // ─── ÅPNINGSTIDER ─────────────────────────────────────────────
    defineField({
      name: 'apningstider',
      title: 'Åpningstider',
      type: 'object',
      fields: [
        defineField({
          name: 'rader',
          title: 'Rader',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'dag',   title: 'Dag(er)',                              type: 'string' }),
              defineField({ name: 'tid',   title: 'Tid (tom = Stengt)',                   type: 'string', description: 'F.eks. «12:00 – 15:00»' }),
              defineField({ name: 'aapen', title: 'Åpent (vises grønt)', type: 'boolean', initialValue: false }),
            ],
            preview: { select: { title: 'dag', subtitle: 'tid' } },
          }],
        }),
        defineField({
          name: 'merknad',
          title: 'Merknad under tabellen',
          type: 'text',
          rows: 2,
          description: 'Teksten «Ta kontakt»-lenken legges alltid til automatisk av nettsiden.',
        }),
      ],
    }),

    // ─── PRISER ───────────────────────────────────────────────────
    defineField({
      name: 'priser',
      title: 'Priser',
      type: 'object',
      fields: [
        defineField({
          name: 'rader',
          title: 'Rader',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'kategori', title: 'Kategori', type: 'string' }),
              defineField({ name: 'pris',     title: 'Pris',     type: 'string', description: 'F.eks. «Gratis» eller «Etter avtale»' }),
              defineField({ name: 'gratis',   title: 'Gratis (vises grønt)', type: 'boolean', initialValue: false }),
            ],
            preview: { select: { title: 'kategori', subtitle: 'pris' } },
          }],
        }),
        defineField({
          name: 'merknad',
          title: 'Merknad under tabellen',
          type: 'text',
          rows: 2,
          description: 'Lenken til arrangementssiden legges til automatisk av nettsiden.',
        }),
      ],
    }),

    // ─── MEDLEMSKAP-SEKSJON ───────────────────────────────────────
    defineField({
      name: 'medlemskapSeksjon',
      title: 'Bli medlem-seksjon',
      type: 'object',
      description: 'Lenken til Vipps-tegning hentes fra Nettstedskonfigurasjon.',
      fields: [
        defineField({ name: 'label',   title: 'Label',       type: 'string' }),
        defineField({ name: 'heading', title: 'Overskrift',  type: 'string' }),
        defineField({ name: 'tekst',   title: 'Brødtekst',   type: 'text', rows: 3 }),
      ],
    }),

    // ─── FORESTILLINGER-SEKSJON ───────────────────────────────────
    defineField({
      name: 'forestillingerSeksjon',
      title: 'Trylleforestillinger-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst',   title: 'Brødtekst',  type: 'text', rows: 3 }),
      ],
    }),

    // ─── SPØRSMÅL-SEKSJON ─────────────────────────────────────────
    defineField({
      name: 'sporsmalSeksjon',
      title: 'Spørsmål-seksjon',
      type: 'object',
      fields: [
        defineField({ name: 'tekst', title: 'Ingress', type: 'text', rows: 2 }),
      ],
    }),

    // ─── KOLLEKTIVTRANSPORT ───────────────────────────────────────
    defineField({
      name: 'transport',
      title: 'Kollektivtransport',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'badge',
            title: 'Badge-tekst',
            type: 'string',
            description: 'F.eks. «T» eller «B»',
          }),
          defineField({
            name: 'farge',
            title: 'Badge-farge',
            type: 'string',
            options: {
              list: [
                { title: 'Rød (T-bane)', value: 'rod'  },
                { title: 'Blå (buss)',   value: 'blaa' },
              ],
              layout: 'radio',
            },
            initialValue: 'rod',
          }),
          defineField({
            name: 'tekst',
            title: 'Beskrivelse',
            type: 'text',
            rows: 2,
          }),
        ],
        preview: { select: { title: 'badge', subtitle: 'tekst' } },
      }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Besøk oss' }),
  },
})
