import { defineType, defineField } from 'sanity'

export const mediaAppearance = defineType({
  name:  'mediaAppearance',
  title: 'Tryllemuseet i media',
  type:  'document',
  icon:  () => '📰',

  fields: [

    // ── Synlighet og fremheving ────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    defineField({
      name:         'featureOnFrontpage',
      title:        'Fremhev på forsiden',
      type:         'boolean',
      initialValue: false,
    }),

    defineField({
      name:        'frontpageUntil',
      title:       'Fremhev til og med',
      type:        'date',
      description: 'Saken fjernes automatisk fra forsiden etter denne datoen. La stå tom for permanent fremheving (mens Vis på forsiden er på).',
      hidden:      ({ parent }: { parent?: Record<string, unknown> }) => !parent?.featureOnFrontpage,
    }),

    // ── Grunninfo ─────────────────────────────────────────────────
    defineField({
      name:       'title',
      title:      'Tittel',
      type:       'string',
      validation: R => R.required(),
    }),

    defineField({
      name:       'slug',
      title:      'URL-slug',
      type:       'slug',
      options:    { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name:       'type',
      title:      'Type',
      type:       'string',
      validation: R => R.required(),
      options: {
        list: [
          { title: 'Avis',     value: 'avis'     },
          { title: 'Nettavis', value: 'nettavis' },
          { title: 'TV',       value: 'tv'        },
          { title: 'Radio',    value: 'radio'     },
          { title: 'Podkast',  value: 'podkast'   },
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name:       'publishedAt',
      title:      'Publisert av kilden',
      type:       'datetime',
      validation: R => R.required(),
    }),

    defineField({
      name:       'sourceName',
      title:      'Kilde',
      type:       'string',
      description: 'F.eks. «Aftenposten»',
      validation: R => R.required(),
    }),

    defineField({
      name:  'sourceUrl',
      title: 'Lenke til originalartikkel',
      type:  'url',
    }),

    // ── Innhold ───────────────────────────────────────────────────
    defineField({
      name:    'image',
      title:   'Faksimile eller pressefoto',
      type:    'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),

    defineField({
      name:        'quote',
      title:       'Sitat/utdrag',
      type:        'text',
      rows:        4,
      description: 'Kort utdrag fra artikkelen – maks 2–3 setninger. Husk kildehenvisning.',
    }),

    defineField({
      name:       'teaser',
      title:      'Ingress til kortet',
      type:       'text',
      rows:       3,
      validation: R => R.required(),
    }),

    // ── Video (kun TV/video) ──────────────────────────────────────
    defineField({
      name:   'videoUrl',
      title:  'Video-URL (YouTube, NRK, etc.)',
      type:   'url',
      hidden: ({ parent }: { parent?: Record<string, unknown> }) => parent?.type !== 'tv',
    }),

    defineField({
      name:        'videoId',
      title:       'YouTube-ID',
      type:        'string',
      description: 'Kun ID-en (f.eks. dQw4w9WgXcQ) for embedded avspilling. La stå tom for kun lenke.',
      hidden:      ({ parent }: { parent?: Record<string, unknown> }) => parent?.type !== 'tv',
    }),

  ],

  orderings: [
    {
      title: 'Publiseringsdato (nyest først)',
      name:  'publishedAtDesc',
      by:    [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title:      'title',
      sourceName: 'sourceName',
      media:      'image',
    },
    prepare({ title, sourceName, media }: {
      title?: string; sourceName?: string; media?: unknown
    }) {
      return {
        title:    title ?? '(uten tittel)',
        subtitle: sourceName,
        media,
      }
    },
  },
})
