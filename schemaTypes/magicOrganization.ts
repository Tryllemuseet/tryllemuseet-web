import { defineType, defineField } from 'sanity'

const bodyAnnotations = [
  {
    name: 'link',
    type: 'object' as const,
    title: 'Ekstern lenke',
    fields: [
      defineField({ name: 'href', title: 'URL', type: 'url' }),
    ],
  },
  {
    name: 'internalLink',
    type: 'object' as const,
    title: 'Intern lenke (HEH)',
    icon: () => '🔗',
    fields: [
      defineField({
        name: 'reference',
        title: 'Magiker (HEH-register)',
        type: 'reference',
        to: [{ type: 'biography' }],
        description: 'Lenker til en person i Magiens Hvem er Hvem-registeret',
      }),
    ],
  },
]

const bodyField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{
      type: 'block',
      marks: {
        decorators: [
          { title: 'Uthevet',     value: 'strong'    },
          { title: 'Kursiv',      value: 'em'        },
          { title: 'Understreket', value: 'underline' },
        ],
        annotations: bodyAnnotations,
      },
    }],
  })

export const magicOrganization = defineType({
  name: 'magicOrganization',
  title: 'Trylleforening / -organisasjon',
  type: 'document',
  icon: () => '♣',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    // ── 1. IDENTITET ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Organisasjonsnavn',
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
      name: 'shortDescription',
      title: 'Kortbeskrivelse',
      type: 'text',
      rows: 3,
      description: 'Vises i listevisning og kortformat.',
    }),

    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),

    defineField({
      name: 'foundedYear',
      title: 'Stiftet (år)',
      type: 'number',
    }),

    defineField({
      name: 'websiteUrl',
      title: 'Nettside',
      type: 'url',
    }),

    // ── 2. BRØDTEKST ──────────────────────────────────────────────
    bodyField('body', 'Brødtekst'),

    // ── 3. ARTIKLER ───────────────────────────────────────────────
    defineField({
      name: 'articles',
      title: 'Artikler',
      type: 'array',
      description: 'Underartikler med egne overskrifter og brødtekst.',
      of: [{
        type: 'object',
        name: 'article',
        title: 'Artikkel',
        fields: [
          defineField({
            name: 'title',
            title: 'Overskrift',
            type: 'string',
            validation: R => R.required(),
          }),
          bodyField('body', 'Brødtekst'),
        ],
        preview: {
          select: { title: 'title' },
          prepare({ title }: { title?: string }) {
            return { title: title ?? '(uten overskrift)' }
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
      title: 'title',
      media: 'logo',
    },
    prepare({ title, media }: { title?: string; media?: unknown }) {
      return {
        title:  title ?? '(uten navn)',
        media,
      }
    },
  },
})
