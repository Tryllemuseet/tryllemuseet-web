import { defineType, defineField } from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Arrangement',
  type: 'document',
  icon: () => '📅',
  fields: [
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
      options: { source: 'title' },
      validation: R => R.required(),
    }),
    defineField({
      name: 'date',
      title: 'Dato og klokkeslett',
      type: 'datetime',
      options: { dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm', timeStep: 15 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'ageGroup',
      title: 'Målgruppe / aldersgruppe',
      type: 'string',
      options: {
        list: [
          { title: 'Familier', value: 'Familier' },
          { title: '6–8 år',   value: '6–8 år'   },
          { title: '9–12 år',  value: '9–12 år'  },
          { title: '13+ år',   value: '13+ år'   },
          { title: 'Voksne',   value: 'Voksne'   },
          { title: 'Alle',     value: 'Alle'     },
        ],
      },
    }),
    defineField({
      name: 'price',
      title: 'Pris',
      type: 'string',
      description: 'F.eks. "Kr 50,–" eller "Gratis"',
    }),
    defineField({
      name: 'excerpt',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 3,
      description: 'Vises i arrangementslisten. Maks 180 tegn.',
      validation: R => R.max(180),
    }),
    defineField({
      name: 'description',
      title: 'Fullstendig beskrivelse',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Bilde / plakat',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Påmeldingslenke',
      type: 'url',
      description: 'Lenke til skjema eller Eventbrite. La stå tom om det ikke kreves påmelding.',
    }),
    defineField({
      name: 'featured',
      title: 'Fremhev på forsiden',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    { title: 'Dato (nærmest først)', name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'date', media: 'image' },
    prepare({ title, subtitle, media }) {
      const d = subtitle ? new Date(subtitle).toLocaleDateString('nb-NO',
        { day: 'numeric', month: 'short', year: 'numeric' }) : ''
      return { title, subtitle: d, media }
    },
  },
})
