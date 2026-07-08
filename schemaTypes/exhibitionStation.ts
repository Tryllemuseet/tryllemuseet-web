import { defineType, defineField } from 'sanity'

export const exhibitionStation = defineType({
  name: 'exhibitionStation',
  title: 'Utstillingsstasjon',
  type: 'document',
  icon: () => '📍',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    // ── 1. GRUNNINFO ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
    }),
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
    }),
    defineField({
      name: 'year',
      title: 'Årstall',
      type: 'string',
      description: 'F.eks. "1908" eller "1874–1887"',
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst (tilgjengelighet)',
          type: 'string',
          validation: R => R.required(),
        }),
      ],
    }),

    // ── 2. TEKSTER ────────────────────────────────────────────────
    defineField({
      name: 'textKids',
      title: '⭐ Tekst (barn)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'textAdults',
      title: 'Tekst (voksne)',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'activityPrompt',
      title: 'Aktivitet / «prøv selv»',
      type: 'string',
      description: 'Valgfritt – kort interaktiv oppfordring',
    }),

    // ── 3. KOBLING ────────────────────────────────────────────────
    defineField({
      name: 'exhibition',
      title: 'Tilhører utstilling',
      type: 'reference',
      to: [{ type: 'exhibitionShow' }],
    }),

  ],
  preview: {
    select: {
      title: 'title',
      year:  'year',
      order: 'order',
      media: 'image',
    },
    prepare({ title, year, order, media }) {
      return {
        title:    `${order ?? '?'}. ${title ?? '(uten navn)'}`,
        subtitle: year ?? '',
        media:    media,
      }
    },
  },
})
