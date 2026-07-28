import { defineType, defineField } from 'sanity'

export const source = defineType({
  name: 'source',
  title: 'Kilde (register)',
  type: 'document',
  icon: () => '📚',
  description: 'Gjenbrukbar kilde — bøker, nettsteder, arkiver o.l. Slås opp fra sourceItem i stedet for å skrive kildeteksten på nytt hver gang.',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. "Magiens Hvem er Hvem" eller "Wikipedia (norsk)"',
      validation: R => R.required(),
    }),
    defineField({
      name: 'author',
      title: 'Forfatter / opphav',
      type: 'string',
      description: 'F.eks. "Terje Nordheim". Valgfritt — la stå tom for kilder uten navngitt forfatter (f.eks. Wikipedia).',
    }),
    defineField({
      name: 'type',
      title: 'Kildetype',
      type: 'string',
      options: {
        list: [
          { title: 'Bok',                value: 'book' },
          { title: 'Nettside',           value: 'website' },
          { title: 'Artikkel',           value: 'article' },
          { title: 'Arkiv / nb.no',      value: 'archive' },
          { title: 'Intervju',           value: 'interview' },
          { title: 'Annet',              value: 'other' },
        ],
      },
      initialValue: 'book',
    }),
    defineField({
      name: 'year',
      title: 'Utgivelsesår',
      type: 'number',
      validation: R => R.integer().min(1400).max(2100),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Valgfri. La stå tom for bøker uten nettlenke.',
    }),
    defineField({
      name: 'note',
      title: 'Notat (internt)',
      type: 'text',
      rows: 2,
      description: 'F.eks. hvilken periode kilden dekker, eller forbehold ved bruk. Vises ikke automatisk på nettsiden.',
    }),
  ],
  orderings: [
    {
      title: 'Tittel (A–Å)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', author: 'author', year: 'year' },
    prepare({ title, author, year }: { title?: string; author?: string; year?: number }) {
      const subtitle = [author, year].filter(Boolean).join(', ')
      return { title: title ?? '(uten tittel)', subtitle }
    },
  },
})
