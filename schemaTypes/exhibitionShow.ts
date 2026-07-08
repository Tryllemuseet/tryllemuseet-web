import { defineType, defineField } from 'sanity'

export const exhibitionShow = defineType({
  name: 'exhibitionShow',
  title: 'Utstilling',
  type: 'document',
  icon: () => '🎪',
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
      description: 'F.eks. "Harry Houdini: Verdens største utbryterkonge"',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hovedbilde',
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

    // ── 2. INTROTEKSTER ───────────────────────────────────────────
    defineField({
      name: 'introKids',
      title: '⭐ Introtekst (barn)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'introAdults',
      title: 'Introtekst (voksne)',
      type: 'text',
      rows: 4,
    }),

    // ── 3. KOBLINGER ──────────────────────────────────────────────
    defineField({
      name: 'relatedMagician',
      title: 'Tilknyttet magiker (Hvem er hvem)',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Oppslaget i «Magiens hvem er hvem» for hovedpersonen i utstillingen.',
    }),
    defineField({
      name: 'stations',
      title: 'Stasjoner',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'exhibitionStation' }] }],
      description: 'Rekkefølgen her styrer rekkefølgen i utstillingen',
    }),

    // ── 4. KILDER ─────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Kilder — eksterne lenker',
      type: 'array',
      description: 'Lenker åpnes i ny fane. Wikipedia, arkiver, fagbøker osv.',
      of: [{ type: 'sourceItem' }],
    }),

  ],
  preview: {
    select: {
      title:    'title',
      subtitle: 'subtitle',
      media:    'heroImage',
    },
  },
})
