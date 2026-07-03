import { defineType, defineField } from 'sanity'
import { NbUrlInput } from './components/NbUrlInput'

export const pressClipping = defineType({
  name: 'pressClipping',
  title: 'Historisk avisartikkel',
  type: 'document',
  icon: () => '📰',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    defineField({
      name:         'needsReview',
      title:        '⚠️ Trenger verifisering',
      type:         'boolean',
      initialValue: false,
      description:  'Markert fordi kilde-URL/dato kan være feil eller delt med en annen artikkel. Sjekk mot nb.no før publisering, og fjern haken når verifisert.',
    }),

    // ── TITLER ────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel (redaksjonell)',
      type: 'string',
      description: 'Deres egen tittel — vises i kortlisten og brukes til SEO. Kan avvike fra original.',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name: 'originalMainTitle',
      title: 'Original hovedtittel',
      type: 'string',
      description: 'Hovedoverskriften slik den sto i avisen.',
    }),

    defineField({
      name: 'originalSubTitle',
      title: 'Original undertittel',
      type: 'text',
      rows: 2,
      description: 'Ingress/underoverskrift fra oppslaget, hvis artikkelen hadde det (mange har en egen boks under hovedtittelen).',
    }),

    // ── DATO / KILDE ──────────────────────────────────────────────
    defineField({
      name: 'publishedAt',
      title: 'Publiseres på tryllemuseet.no',
      type: 'datetime',
      description: 'Sett fremtidig dato for planlagt publisering – artikkelen vises automatisk fra denne datoen.',
      validation: R => R.required(),
    }),

    defineField({
      name: 'originalDate',
      title: 'Avisens dato',
      type: 'date',
      description: 'Når artikkelen sto på trykk i avisen.',
    }),

    defineField({
      name: 'sourceName',
      title: 'Avis/kilde',
      type: 'string',
      description: 'F.eks. «Aftenposten»',
    }),

    defineField({
      name: 'sourceUrl',
      title: 'Lenke til nb.no',
      type: 'url',
      validation: R => R.required(),
      components: { input: NbUrlInput },
    }),

    // ── RETTIGHETER ───────────────────────────────────────────────
    defineField({
      name: 'isPublicDomain',
      title: 'Falt i det fri (eldre enn ca. 70 år)',
      type: 'boolean',
      initialValue: false,
      description: '⚖️ Styrer om faksimilebilder faktisk vises på nettsiden. Sjekk avisens dato før du slår denne på — usikker på om artikkelen er fri? La den stå av.',
    }),

    // ── BILDER (array) ────────────────────────────────────────────
    defineField({
      name: 'images',
      title: 'Faksimiler/utsnitt',
      type: 'array',
      description: 'Kun aviser falt i det fri (se «Falt i det fri» over) — bildene vises IKKE på siden hvis feltet over ikke er slått på, uansett hva som ligger her.',
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
    }),

    // ── TEKST ─────────────────────────────────────────────────────
    defineField({
      name: 'teaser',
      title: 'Ingress / teaser',
      type: 'text',
      rows: 3,
      description: 'Kort tekst som vises i kortlisten. Maks ~200 tegn.',
      validation: R => R.required().warning('Anbefalt maks 200 tegn', { min: 0, max: 200 }),
    }),

    defineField({
      name: 'rewrittenText',
      title: 'Omskrevet artikkeltekst (vises på siden)',
      type: 'text',
      rows: 12,
      description: '📝 Deres egen frie gjengivelse av innholdet, i egne ord. Dette — ikke originalteksten — er det besøkende leser i modalen. Bruk «Original fulltekst» under som kilde mens du skriver.',
    }),

    defineField({
      name: 'commentary',
      title: 'Museets kommentar',
      type: 'text',
      rows: 5,
      description: 'Kort kontekst som vises i arkivet.',
    }),

    defineField({
      name: 'originalFullText',
      title: '🔒 Original fulltekst (internt — vises ALDRI på nettsiden)',
      type: 'text',
      rows: 16,
      description: 'Lim inn hele den transkriberte avisteksten her som referanse. Kun for redaktørens bruk i Studio — hentes aldri ut i front-end-spørringene, uansett alder på artikkelen.',
    }),

    // ── SOME ──────────────────────────────────────────────────────
    defineField({
      name: 'someText',
      title: 'SoMe-tekst (Instagram/Facebook)',
      type: 'text',
      rows: 6,
      description: 'Ferdig posttekst inkl. emneknagger – kopieres til Meta Business Suite.',
    }),

    defineField({
      name: 'instagramText',
      title: 'Instagram-tekst',
      type: 'text',
      rows: 5,
      description: 'Bildetekst til Instagram. Kortere og mer visuell tone enn Facebook – maks 2200 tegn, men algoritmen foretrekker under 125.',
    }),

    defineField({
      name: 'tiktokText',
      title: 'TikTok-tekst',
      type: 'text',
      rows: 4,
      description: 'Undertekst / caption til TikTok-video. Ung målgruppe — kort, fengende, 3–5 emneknagger. Maks 2200 tegn.',
    }),

    // ── KATEGORISERING ────────────────────────────────────────────
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
    }),

    defineField({
      name: 'mentionedMagicians',
      title: 'Omtalte tryllekunstnere',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'biography' }] }],
      description: 'Tryllekunstnere omtalt i artikkelen — lenkes automatisk til «Hvem er hvem»-profilen.',
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
