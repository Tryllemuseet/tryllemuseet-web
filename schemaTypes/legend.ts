// schemaTypes/legend.ts
import { defineType, defineField } from 'sanity'

export const legend = defineType({
  name: 'legend',
  title: 'Norsk legende',
  type: 'document',
  icon: () => '🌟',
  fields: [

    // ── 1. IDENTITET ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Navn / tittel',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name: 'biographyRef',
      title: 'Kobling til biografi',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Koble til en eksisterende biografi i HEH-registeret.',
    }),

    // ── 2. INNHOLD ────────────────────────────────────────────────
    defineField({
      name: 'excerpt',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      description: 'Kort tekst som vises på oversiktssiden.',
    }),

    defineField({
      name: 'content',
      title: 'Brødtekst',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    defineField({
      name: 'tags',
      title: 'Tagger',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── 3. MEDIA ──────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt',     title: 'Alt-tekst',  type: 'string' }),
        defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
      ],
    }),

    defineField({
      name: 'gallery',
      title: 'Bildegalleri',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({ name: 'alt',     title: 'Alt-tekst',  type: 'string' }),
          defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
        ],
      }],
    }),

    defineField({
      name: 'videos',
      title: 'Videoer',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Tittel', type: 'string', validation: R => R.required() }),
          defineField({ name: 'url',   title: 'URL',    type: 'url',    validation: R => R.required() }),
          defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
              list: [
                { title: 'TV-opptreden',  value: 'tv'        },
                { title: 'Intervju',      value: 'intervju'  },
                { title: 'Opptreden',     value: 'opptreden' },
                { title: 'Annet',         value: 'annet'     },
              ],
            },
          }),
          defineField({ name: 'year', title: 'År', type: 'number' }),
        ],
        preview: {
          select: { title: 'title', year: 'year' },
          prepare({ title, year }: { title?: string; year?: number }) {
            return { title: title ?? '(uten tittel)', subtitle: year ? String(year) : '' }
          },
        },
      }],
    }),

    // ── 4. KILDER ─────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Kilder',
      type: 'array',
      of: [{ type: 'sourceItem' }],
    }),

  ],

  orderings: [
    {
      title: 'Navn (A–Å)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title:  'title',
      media:  'mainImage',
    },
    prepare({ title, media }: { title?: string; media?: unknown }) {
      return {
        title:  title ?? '(uten tittel)',
        media,
      }
    },
  },
})
