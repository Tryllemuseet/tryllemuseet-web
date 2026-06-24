import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'signageVideo',
  title: 'Infoskjerm – video',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel (internt)',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video-URL',
      type: 'url',
      description: 'Direkte lenke til MP4-fil, eller YouTube-URL (youtube.com/watch?v=…)',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'startSecs',
      title: 'Start fra (sekunder)',
      type: 'number',
      description: 'Hopp til dette sekundet ved oppstart. 0 = fra begynnelsen.',
      initialValue: 0,
    }),
    defineField({
      name: 'endSecs',
      title: 'Stopp ved (sekunder)',
      type: 'number',
      description: 'Avslutt avspilling her. 0 = spill til slutten av videoen.',
      initialValue: 0,
    }),
    defineField({
      name: 'active',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Kun aktive videoer spilles av på skjermen.',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavere tall spilles av først.',
    }),
  ],
  orderings: [
    {
      title: 'Rekkefølge',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'videoUrl', active: 'active' },
    prepare({ title, subtitle, active }: { title?: string; subtitle?: string; active?: boolean }) {
      return {
        title: (active === false ? '⏸ ' : '▶ ') + (title ?? '(uten tittel)'),
        subtitle: subtitle ?? '',
      }
    },
  },
})
