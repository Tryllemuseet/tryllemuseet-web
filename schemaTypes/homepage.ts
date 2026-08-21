// schemaTypes/homepage.ts
import { defineField, defineType } from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Forside',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── HERO-BANNERE (karusell i toppen) ───────────────────────
    defineField({
      name: 'heroBannere',
      title: 'Hero-bannere (karusell i toppen)',
      description: 'Appetittvekkere øverst på forsiden. Hver banner har bilde eller video, en kort todelt tekst og en lenke. Vises i rekkefølgen her.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
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

    // ─── HERO ─────────────────────────────────────────────────
    // ⚠️ Vises ikke på nettsiden. Forsiden bruker Hero-bannere (over) i
    // stedet siden banner-karusellen erstattet dette feltet. Beholdt i
    // skjemaet i tilfelle innholdet skal gjenbrukes — ikke rediger dette
    // og forvent at det vises.
    defineField({
      name: 'hero',
      title: '⚠️ Hero (vises ikke på nettsiden)',
      description: 'Brukes ikke lenger — forsiden viser «Hero-bannere» (karusellen øverst i dette skjemaet) i stedet. Feltene her har ingen synlig effekt.',
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
    // ⚠️ Vises ikke på nettsiden — se merknad på «Hero» over.
    defineField({
      name: 'infoBadges',
      title: '⚠️ Info-badges (vises ikke på nettsiden)',
      description: 'Brukes ikke lenger — hørte til det gamle Hero-oppsettet over. Ingen synlig effekt.',
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

    // ─── FREMHEVET INNHOLD ──────────────────────────────────────
    defineField({
      name: 'fremhevetInnhold',
      title: 'Fremhevet innhold',
      type: 'object',
      fields: [
        defineField({
          name: 'eraLabel',
          title: '⚠️ Tidsperiode-label (vises ikke på nettsiden)',
          type: 'string',
          description: 'Brukes ikke lenger — seksjonsoverskriften «Historie og aktuelt» er fast i koden. Ingen synlig effekt.',
        }),
        defineField({
          name: 'heading',
          title: '⚠️ Overskrift (vises ikke på nettsiden)',
          type: 'string',
          description: 'Brukes ikke lenger — seksjonsoverskriften «Historie og aktuelt» er fast i koden. Ingen synlig effekt.',
        }),
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
      description: 'Overskrift og ingress brukes som tekst på «Barn & unge»-kortet i «Dette kan du oppleve» når det kortet ikke er overstyrt i feltet over. Features/sitater under vises ikke på nettsiden.',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({
          name: 'features',
          title: '⚠️ Aktiviteter/features (vises ikke på nettsiden)',
          description: 'Brukes ikke lenger. Ingen synlig effekt.',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'sitater',
          title: '⚠️ Sitater (vises ikke på nettsiden)',
          description: 'Brukes ikke lenger. Ingen synlig effekt.',
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
        // Button URL comes from siteConfig.membershipUrl — one source for all
        // «Bli medlem» links across the site.
      ],
    }),

    // ─── OM MUSEET ──────────────────────────────────────────────
    // ⚠️ Vises ikke på nettsiden — forsiden har ingen egen «Om museet»-seksjon lenger.
    defineField({
      name: 'omMuseet',
      title: '⚠️ Om museet-seksjon (vises ikke på nettsiden)',
      description: 'Brukes ikke lenger — forsiden har ingen egen «Om museet»-seksjon i dagens design. Ingen synlig effekt.',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 4 }),
        defineField({ name: 'sitat', title: 'Sitat', type: 'text', rows: 2 }),
        defineField({ name: 'sitatKilde', title: 'Sitatets kilde', type: 'string' }),
      ],
    }),

    // ─── KURS-SEKSJON ───────────────────────────────────────────
    defineField({
      name: 'kursSeksjon',
      title: 'Kurs-seksjon',
      description: 'Overskrift, ingress og knapp brukes som tekst/lenke på «Kurs»-kortet i «Dette kan du oppleve» når det kortet ikke er overstyrt i feltet over. Detaljer/pris/prislabel/fondsbadge under vises ikke på nettsiden.',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Overskrift', type: 'string' }),
        defineField({ name: 'ingress', title: 'Ingress', type: 'text', rows: 2 }),
        defineField({
          name: 'detaljer',
          title: '⚠️ Detaljer (vises ikke på nettsiden)',
          description: 'Brukes ikke lenger. Ingen synlig effekt.',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({ name: 'pris', title: '⚠️ Pris (vises ikke på nettsiden)', type: 'string', description: 'Brukes ikke lenger. Ingen synlig effekt.' }),
        defineField({ name: 'prisLabel', title: '⚠️ Prislabel (vises ikke på nettsiden)', type: 'string', description: 'Brukes ikke lenger. Ingen synlig effekt.' }),
        defineField({ name: 'fondsBadge', title: '⚠️ Fondsbadge (vises ikke på nettsiden)', type: 'string', description: 'Brukes ikke lenger. Ingen synlig effekt.' }),
        defineField({ name: 'knappLabel', title: 'Knapp — tekst', type: 'string' }),
        defineField({ name: 'knappHref', title: 'Knapp — URL', type: 'string' }),
      ],
    }),

    // ─── KURSSITAT ──────────────────────────────────────────────
    // ⚠️ Vises ikke på nettsiden — se merknad på «Om museet» over.
    defineField({
      name: 'kursSitat',
      title: '⚠️ Kurssitat (vises ikke på nettsiden)',
      description: 'Brukes ikke lenger. Ingen synlig effekt.',
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
