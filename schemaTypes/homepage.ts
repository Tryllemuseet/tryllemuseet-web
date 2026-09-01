// schemaTypes/homepage.ts
import { defineField, defineType } from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Forside',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO-IDENTITET (fast linje over karusellen) ─────────────
    defineField({
      name: 'heroIdentitet',
      title: 'Hero-identitet (fast linje over karusellen)',
      description: 'Alltid synlig linje øverst på forsiden, uavhengig av hvilken karusell-slide som vises — skal umiddelbart gjøre klart at Tryllemuseet er et fysisk museum man kan besøke.',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Museumsnavn', type: 'string' }),
        defineField({ name: 'sted', title: 'Stedsbeskrivelse', type: 'string', description: 'F.eks. «på Årvoll gård i Oslo»' }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

    // ─── HERO-BANNERE (karusell i toppen) ───────────────────────
    defineField({
      name: 'heroBannere',
      title: 'Hero-bannere (karusell i toppen)',
      description: 'Appetittvekkere øverst på forsiden. Hver banner har bilde eller video, en kort todelt tekst og en lenke. Vises i rekkefølgen her.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'etikett',
            title: 'Kicker-tekst (valgfri)',
            type: 'string',
            description: 'Liten tekst over tekstlinje 1, f.eks. «Høstens hovedutstilling». Bruk sparsomt — kun for banneret som skal fremheves.',
          }),
          defineField({ name: 'tekstLinje1', title: 'Tekstlinje 1 (stor)', type: 'string', validation: (R) => R.required() }),
          defineField({ name: 'tekstLinje2', title: 'Tekstlinje 2', type: 'string' }),
          defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
          defineField({ name: 'href', title: 'Lenke (URL)', type: 'string', validation: (R) => R.required() }),
          defineField({
            name: 'bilde',
            title: 'Bilde',
            type: 'image',
            options: { hotspot: true },
            fields: [
              defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
            ],
          }),
          defineField({
            name: 'video',
            title: 'Video (valgfri — brukes i stedet for bildet)',
            type: 'file',
            options: { accept: 'video/*' },
            description: 'Kort, stum løkke-video (mp4). Vises i stedet for bildet hvis satt.',
          }),
        ],
        preview: {
          select: { title: 'tekstLinje1', subtitle: 'href', media: 'bilde' },
        },
      }],
      validation: (R) => R.max(6),
    }),

    // ─── DETTE KAN DU OPPLEVE (4 kort) ───────────────────────────
    defineField({
      name: 'oppleveKort',
      title: 'Dette kan du oppleve (4 kort)',
      description: 'De fire kortene i «Dette kan du oppleve»-seksjonen på forsiden, rett under arrangement-kalenderen. La stå tom for å bruke de innebygde standardkortene (Houdini/utstillingen, Barn & unge, Kurs, Magiens historie).',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'icon',
            title: 'Ikon (emoji)',
            type: 'string',
            description: 'Vises kun hvis du ikke laster opp et bilde under, f.eks. «🎩»',
          }),
          defineField({
            name: 'bilde',
            title: 'Bilde',
            type: 'image',
            options: { hotspot: true },
            fields: [
              defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
            ],
          }),
          defineField({
            name: 'label',
            title: 'Kicker-tekst (valgfri)',
            type: 'string',
            description: 'Liten tekst over tittelen, f.eks. «Utstillingen»',
          }),
          defineField({ name: 'title', title: 'Tittel', type: 'string', validation: (R) => R.required() }),
          defineField({
            name: 'description',
            title: 'Beskrivelse',
            type: 'text',
            rows: 2,
            validation: (R) => R.required(),
          }),
          defineField({
            name: 'href',
            title: 'Lenke',
            type: 'string',
            description: 'Intern sti, f.eks. /utstillingen',
            validation: (R) => R.required(),
          }),
          defineField({
            name: 'knappTekst',
            title: 'Knappetekst',
            type: 'string',
            description: 'F.eks. «Se utstillingen» — pilen (→) legges til automatisk',
          }),
        ],
        preview: {
          select: { title: 'title', subtitle: 'label', media: 'bilde' },
        },
      }],
      validation: (R) => R.max(4),
    }),

    // ─── FREMHEVET INNHOLD ──────────────────────────────────────
    defineField({
      name: 'fremhevetInnhold',
      title: 'Fremhevet innhold',
      type: 'object',
      fields: [
        defineField({
          name: 'elementer',
          title: 'Håndplukket innhold (maks 5)',
          description: 'Fordypninger (Gullalderen/Houdini-stil eller vanlige artikler), historiske avisartikler og historiske TV-opptak kan blandes fritt.',
          type: 'array',
          of: [{
            type: 'reference',
            to: [
              { type: 'legend' },
              { type: 'historiskeKlippNb' },
              { type: 'historicalClip' },
            ],
          }],
          validation: (R) => R.max(5),
        }),
      ],
    }),

    // ─── BARN & UNGE ────────────────────────────────────────────
    defineField({
      name: 'barnSeksjon',
      title: 'Barn & unge-seksjon',
      description: 'Overskrift og ingress brukes som tekst på «Barn & unge»-kortet i «Dette kan du oppleve» når det kortet ikke er overstyrt i feltet over.',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
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
        // Button URL comes from siteConfig.membershipUrl — one source for all
        // «Bli medlem» links across the site.
      ],
    }),

    // ─── KURS-SEKSJON ───────────────────────────────────────────
    defineField({
      name: 'kursSeksjon',
      title: 'Kurs-seksjon',
      description: 'Overskrift, ingress og knapp brukes som tekst/lenke på «Kurs»-kortet i «Dette kan du oppleve» når det kortet ikke er overstyrt i feltet over.',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Forside' }),
  },
})
