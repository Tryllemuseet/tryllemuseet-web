import { defineType, defineField } from 'sanity'

export const source = defineType({
  name: 'source',
  title: 'Kilde',
  type: 'document',
  icon: () => '🔖',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel / kildebeskrivelse',
      type: 'string',
      description: 'F.eks. "Magiens Hvem er Hvem — Terje Nordheim (2005)" eller "Store norske leksikon"',
      validation: R => R.required(),
    }),
    defineField({
      name: 'type',
      title: 'Kildetype',
      type: 'string',
      options: {
        list: [
          { title: 'Bok',                 value: 'book'      },
          { title: 'Nettside / leksikon', value: 'website'   },
          { title: 'Avisartikkel',        value: 'newspaper' },
          { title: 'Arkiv / dokument',    value: 'archive'   },
          { title: 'Intervju',            value: 'interview' },
          { title: 'Annet',               value: 'other'     },
        ],
      },
    }),
    defineField({
      name: 'author',
      title: 'Forfatter',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Utgivelses-/publiseringsår',
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
      name: 'bookRef',
      title: 'Kobling til bok i bokregisteret',
      type: 'reference',
      to: [{ type: 'book' }],
      description: 'Valgfri — bruk hvis kilden også finnes som eget dokument i bokregisteret (ressurser/bibliotek).',
    }),
    defineField({
      name: 'notes',
      title: 'Interne notater (vises ikke på nettsiden)',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'title', author: 'author', year: 'year' },
    prepare({ title, author, year }: { title?: string; author?: string; year?: number }) {
      const subtitle = [author, year].filter(Boolean).join(', ')
      return { title: title ?? '(uten tittel)', subtitle }
    },
  },
  orderings: [
    { title: 'Tittel A–Å', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
})
