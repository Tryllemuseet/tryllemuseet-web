import { defineType, defineField } from 'sanity'

export const specialExhibition = defineType({
  name: 'specialExhibition',
  title: 'Spesialutstilling',
  type: 'document',
  icon: () => '🎪',
  fields: [
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),
    defineField({
      name:  'title',
      title: 'Tittel',
      type:  'string',
      validation: R => R.required(),
    }),
    defineField({
      name:    'slug',
      title:   'URL-slug',
      type:    'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),
    defineField({
      name:    'status',
      title:   'Status',
      type:    'string',
      options: {
        list: [
          { title: 'Teaser — «Kommer snart»',   value: 'teaser'   },
          { title: 'Aktiv — utstillingen pågår', value: 'active'   },
          { title: 'Arkivert — avsluttet',       value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'teaser',
      validation: R => R.required(),
      description: 'Byttes manuelt av redaktør. Datoene nedenfor er veiledende påminnere.',
    }),
    defineField({
      name:    'currentSection',
      title:   'Nav-seksjon',
      type:    'string',
      options: {
        list: [
          { title: 'Under Utstillingen',   value: 'utstillingen'   },
          { title: 'Under Tryllehistorie', value: 'tryllehistorie' },
        ],
        layout: 'radio',
      },
      initialValue: 'utstillingen',
      description: 'Bestemmer hvilken navigasjonsseksjon siden lenkes fra. Endre til Tryllehistorie etter avsluttet utstilling.',
    }),
    defineField({
      name:        'teaserDate',
      title:       'Teaser-start (veiledende)',
      type:        'date',
      description: 'Påminnelse om når status bør settes til «Teaser».',
    }),
    defineField({
      name:        'openDate',
      title:       'Åpningsdato',
      type:        'date',
      validation:  R => R.required(),
      description: 'Vises som «Åpner [dato]» i teaser-tilstand.',
    }),
    defineField({
      name:        'closeDate',
      title:       'Sluttdato',
      type:        'date',
      validation:  R => R.required(),
      description: 'Vises som «Pågår til [dato]».',
    }),
    defineField({
      name:    'heroImage',
      title:   'Hovedbilde',
      type:    'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),
    defineField({
      name:        'excerpt',
      title:       'Kort beskrivelse',
      type:        'text',
      rows:        2,
      description: 'Brukes i søkeresultater og delelenker. Maks ~200 tegn.',
    }),
    defineField({
      name:        'teaserContent',
      title:       'Teasertekst',
      type:        'array',
      of:          [{ type: 'block' }],
      description: 'Vises kun i teaser-tilstand. Kan fortelle litt om hva som kommer uten å avsløre alt.',
    }),
    defineField({
      name:        'introContent',
      title:       'Innledning',
      type:        'array',
      of:          [{ type: 'block' }],
      description: 'Hoved-ingress — vises når utstillingen er aktiv eller arkivert.',
    }),
    defineField({
      name:        'infoSections',
      title:       'Informasjonsseksjoner',
      type:        'array',
      of:          [{ type: 'contentSection' }],
      description: 'Redaksjonelle tekstblokker — tilsvarer oppslag og plakattekster i det fysiske museet.',
    }),
  ],

  orderings: [
    {
      title: 'Åpningsdato (nyest først)',
      name:  'openDateDesc',
      by:    [{ field: 'openDate', direction: 'desc' }],
    },
  ],

  preview: {
    select: { title: 'title', status: 'status', media: 'heroImage' },
    prepare({ title, status, media }: { title?: string; status?: string; media?: unknown }) {
      const label: Record<string, string> = {
        teaser:   '🔜 Teaser',
        active:   '✅ Aktiv',
        archived: '📦 Arkivert',
      }
      return {
        title:    title ?? '(uten tittel)',
        subtitle: label[status ?? ''] ?? status,
        media,
      }
    },
  },
})
