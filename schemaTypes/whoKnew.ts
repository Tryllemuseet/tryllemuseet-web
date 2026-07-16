// schemaTypes/whoKnew.ts
import { defineType, defineField } from 'sanity'

export const whoKnew = defineType({
  name:  'whoKnew',
  title: 'Hvem skulle trodd?',
  type:  'document',
  icon:  () => '🎩',

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
      description:  'Vises som spotlight-kort i «Hvem skulle trodd?»-seksjonen på forsiden.',
    }),

    defineField({
      name:        'frontpageOrder',
      title:       'Rekkefølge på forsiden',
      type:        'number',
      description: 'Lavest tall vises først når flere er fremhevet samtidig. La stå tom for å sortere etter navn.',
      hidden:      ({ parent }: { parent?: Record<string, unknown> }) => !parent?.featureOnFrontpage,
    }),

    // ── Grunninfo ─────────────────────────────────────────────────
    defineField({
      name:       'name',
      title:      'Navn',
      type:       'string',
      validation: R => R.required(),
    }),

    defineField({
      name:       'slug',
      title:      'URL-slug',
      type:       'slug',
      options:    { source: 'name', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name:       'category',
      title:      'Kategori',
      type:       'string',
      validation: R => R.required(),
      options: {
        list: [
          { title: 'Vitenskap',              value: 'vitenskap' },
          { title: 'Politikk & samfunn',     value: 'politikk'  },
          { title: 'Sport',                  value: 'sport'     },
          { title: 'Kultur & underholdning', value: 'kultur'    },
        ],
        layout: 'radio',
      },
    }),

    // ── Innhold ───────────────────────────────────────────────────
    defineField({
      name:        'hook',
      title:       'Krok (korttekst)',
      type:        'text',
      rows:        3,
      description: 'Kort «visste du at»-tekst til spotlight-kortet, maks 2–3 setninger.',
      validation: R => R.required(),
    }),

    defineField({
      name:  'body',
      title: 'Brødtekst',
      type:  'array',
      of:    [{ type: 'block' }],
      description: 'Valgfri, lengre artikkeltekst til egen side. Kan stå tom dersom «Koblet til» peker på en side som allerede har historien.',
    }),

    defineField({
      name:    'image',
      title:   'Bilde',
      type:    'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),

    defineField({
      name:        'relatedRef',
      title:       'Koblet til',
      type:        'reference',
      to:          [{ type: 'legend' }, { type: 'magician' }],
      description: 'Valgfri kobling til en eksisterende legende eller utstillingsfelt, f.eks. Henrik Ibsen. Lenkes til fra egen side som «Les hele historien».',
    }),

    // ── Kilder ────────────────────────────────────────────────────
    defineField({
      name:  'sources',
      title: 'Kilder',
      type:  'array',
      of:    [{ type: 'sourceItem' }],
    }),

  ],

  orderings: [
    {
      title: 'Navn (A–Å)',
      name:  'nameAsc',
      by:    [{ field: 'name', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title:    'name',
      category: 'category',
      media:    'image',
    },
    prepare({ title, category, media }: { title?: string; category?: string; media?: unknown }) {
      return {
        title:    title ?? '(uten navn)',
        subtitle: category,
        media,
      }
    },
  },
})
