import { defineType, defineField } from 'sanity'
import { NbUrlInput } from './components/NbUrlInput'

export const historiskeKlippNb = defineType({
  name: 'historiskeKlippNb',
  title: 'Historisk avisartikkel',
  type: 'document',
  icon: () => '📰',

  groups: [
    { name: 'content',  title: 'Innhold',              default: true },
    { name: 'source',   title: 'Original kilde' },
    { name: 'rights',   title: 'Rettigheter & bilder' },
    { name: 'some',     title: 'SoMe' },
    { name: 'metadata', title: 'Metadata' },
  ],

  fields: [

    // ── METADATA ──────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
      group:        'metadata',
    }),

    defineField({
      name:         'needsReview',
      title:        '⚠️ Trenger verifisering',
      type:         'boolean',
      initialValue: false,
      description:  'Markert fordi kilde-URL/dato kan være feil eller delt med en annen artikkel. Sjekk mot nb.no før publisering, og fjern haken når verifisert.',
      group:        'metadata',
    }),

    // ── INNHOLD ───────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel (redaksjonell)',
      type: 'string',
      description: 'Deres egen tittel — vises i kortlisten og brukes til SEO. Kan avvike fra original.',
      validation: R => R.required(),
      group: 'content',
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
      group: 'content',
    }),

    // ── ORIGINAL KILDE (URL og fulltekst FØRST — kopieres tidlig i arbeidsflyten) ──
    defineField({
      name: 'sourceUrl',
      title: 'Lenke til nb.no',
      type: 'url',
      validation: R => R.required(),
      components: { input: NbUrlInput },
      group: 'source',
    }),

    defineField({
      name: 'originalFullText',
      title: '🔒 Original fulltekst (internt — vises ALDRI på nettsiden)',
      type: 'text',
      rows: 16,
      description: 'Lim inn hele den transkriberte avisteksten her rett etter du har limt inn URL-en. Kun for redaktørens bruk i Studio — hentes aldri ut i front-end-spørringene, uansett alder på artikkelen.',
      group: 'source',
    }),

    defineField({
      name: 'originalKicker',
      title: 'Original liten tittel (kicker)',
      type: 'string',
      description: 'Kort tekst over hovedoverskriften, f.eks. «Vi besøker:».',
      group: 'source',
    }),

    defineField({
      name: 'originalMainTitle',
      title: 'Original stor tittel (hovedoverskrift)',
      type: 'string',
      description: 'Selve hovedoverskriften slik den sto i avisen.',
      group: 'source',
    }),

    defineField({
      name: 'originalIngress',
      title: 'Original ingress/undertittel',
      type: 'text',
      rows: 3,
      description: 'Ingressboksen under hovedoverskriften, hvis artikkelen hadde en.',
      group: 'source',
    }),

    defineField({
      name: 'sourceName',
      title: 'Avis/kilde',
      type: 'string',
      description: 'F.eks. «Aftenposten»',
      group: 'source',
    }),

    defineField({
      name: 'originalDate',
      title: 'Avisens dato',
      type: 'date',
      description: 'Når artikkelen sto på trykk i avisen. Styrer automatisk 70-årsvurderingen for bilder (se fanen «Rettigheter & bilder»).',
      group: 'source',
    }),

    // ── PUBLISERING ───────────────────────────────────────────────
    defineField({
      name: 'publishedAt',
      title: 'Publiseres på tryllemuseet.no',
      type: 'datetime',
      description: 'Sett fremtidig dato for planlagt publisering – artikkelen vises automatisk fra denne datoen.',
      validation: R => R.required(),
      group: 'metadata',
    }),

    defineField({
      name: 'featuredDurationDays',
      title: 'Fremhevet på forsiden i antall dager',
      type: 'number',
      initialValue: 7,
      description: 'Hvor lenge artikkelen vises som «siste artikkel» på forsiden, regnet fra publiseringsdato. Artikkelen forblir uansett synlig i det fulle arkivet permanent.',
      validation: R => R.min(1).integer(),
      group: 'metadata',
    }),

    // ── RETTIGHETER & BILDER ──────────────────────────────────────
    defineField({
      name: 'copyrightOverride',
      title: 'Opphavsrettsvurdering',
      type: 'string',
      initialValue: 'auto',
      options: {
        list: [
          { title: 'Automatisk (70 år fra trykkedato)', value: 'auto'  },
          { title: 'Tving vis bilder',                   value: 'show' },
          { title: 'Tving skjul bilder',                  value: 'hide' },
        ],
        layout: 'radio',
      },
      description: '⚖️ «Automatisk» beregnes ut fra avisens dato hver gang siden bygges på nytt (daglig). Bruk overstyring kun ved konkret vurdering av at regelen ikke stemmer for denne artikkelen.',
      group: 'rights',
    }),

    defineField({
      name: 'images',
      title: 'Faksimiler/utsnitt',
      type: 'array',
      description: 'Vises på siden kun hvis opphavsrettsvurderingen over tilsier det.',
      of: [
        defineField({
          name: 'faksimile',
          type: 'image',
          title: 'Faksimile',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt-tekst', type: 'string', validation: R => R.required() }),
            defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
          ],
        }),
      ],
      group: 'rights',
    }),

    // ── INNHOLD (fortsettelse) ────────────────────────────────────
    defineField({
      name: 'teaser',
      title: 'Ingress / teaser',
      type: 'text',
      rows: 3,
      description: 'Kort tekst som vises i kortlisten. Maks ~200 tegn.',
      validation: R => R.required().warning('Anbefalt maks 200 tegn', { min: 0, max: 200 }),
      group: 'content',
    }),

    defineField({
      name: 'rewrittenText',
      title: 'Omskrevet artikkeltekst (vises på siden)',
      type: 'text',
      rows: 12,
      description: '📝 Deres egen frie gjengivelse av innholdet, i egne ord. Dette — ikke originalteksten — er det besøkende leser i modalen.',
      group: 'content',
    }),

    defineField({
      name: 'commentary',
      title: 'Museets kommentar',
      type: 'text',
      rows: 5,
      description: 'Kort kontekst som vises i arkivet.',
      group: 'content',
    }),

    defineField({
      name: 'mentionedMagicians',
      title: 'Omtalte tryllekunstnere',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'biography' }] }],
      description: 'Tryllekunstnere omtalt i artikkelen — lenkes automatisk til «Hvem er hvem»-profilen.',
      group: 'content',
    }),

    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Artist / tryllekunstner', value: 'artist'        },
          { title: 'Forestilling',            value: 'forestilling'  },
          { title: 'Presseomtale',            value: 'presseomtale'  },
          { title: 'Annonse',                 value: 'annonse'       },
          { title: 'Kuriosa',                 value: 'kuriosa'       },
          { title: 'Annet',                   value: 'annet'         },
        ],
        layout: 'radio',
      },
      group: 'metadata',
    }),

    // ── SOME ──────────────────────────────────────────────────────
    defineField({
      name: 'someText',
      title: 'SoMe-tekst (Instagram/Facebook)',
      type: 'text',
      rows: 6,
      description: 'Ferdig posttekst inkl. emneknagger – kopieres til Meta Business Suite.',
      group: 'some',
    }),

    defineField({
      name: 'instagramText',
      title: 'Instagram-tekst',
      type: 'text',
      rows: 5,
      description: 'Bildetekst til Instagram. Kortere og mer visuell tone enn Facebook – maks 2200 tegn, men algoritmen foretrekker under 125.',
      group: 'some',
    }),

    defineField({
      name: 'tiktokText',
      title: 'TikTok-tekst',
      type: 'text',
      rows: 4,
      description: 'Undertekst / caption til TikTok-video. Ung målgruppe — kort, fengende, 3–5 emneknagger. Maks 2200 tegn.',
      group: 'some',
    }),

  ],

  orderings: [
    {
      title: 'Publiseringsdato (nyest først)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title:       'title',
      sourceName:  'sourceName',
      date:        'originalDate',
      media:       'images.0',
      needsReview: 'needsReview',
    },
    prepare({ title, sourceName, date, media, needsReview }: {
      title?: string; sourceName?: string; date?: string; media?: unknown; needsReview?: boolean
    }) {
      const parts = [sourceName, date].filter(Boolean).join(' · ')
      return {
        title:    (needsReview ? '⚠️ ' : '') + (title ?? '(uten tittel)'),
        subtitle: parts || undefined,
        media,
      }
    },
  },
})
