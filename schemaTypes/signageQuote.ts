import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'signageQuote',
  title: 'Infoskjerm – sitat',
  type: 'document',
  fields: [
    defineField({
      name: 'text',
      title: 'Sitatets tekst',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(220),
    }),
    defineField({
      name: 'author',
      title: 'Kilde / person',
      type: 'string',
      description: 'F.eks. «Jan Crosby», «Magiens Hvem er Hvem», «Norges Tryllemuseum»',
    }),
    defineField({
      name: 'active',
      title: 'Aktiv',
      type: 'boolean',
      description: 'Kun aktive sitater vises på skjermen',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavere tall vises først',
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
    select: { title: 'text', subtitle: 'author' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title && title.length > 60 ? title.slice(0, 60) + '…' : title,
        subtitle: subtitle || '(ingen kilde)',
      }
    },
  },
})
