import { defineField } from 'sanity'

// Reusable Portable Text config: paragraphs/headings with external links,
// internal links (to a Hvem er hvem biography), and inline images. Used by
// legend.ts, contentSection.ts and magicOrganization.ts so every rich-text
// field in the Studio behaves identically, and renders identically via
// portableTextToHtml() in web/src/lib/sanity.ts.
export function richBlockContent(styles?: { title: string; value: string }[]) {
  return [
    {
      type: 'block',
      styles: styles ?? [
        { title: 'Normaltekst', value: 'normal' },
        { title: 'Overskrift 2', value: 'h2' },
        { title: 'Overskrift 3', value: 'h3' },
        { title: 'Sitat', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Fet', value: 'strong' },
          { title: 'Kursiv', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Ekstern lenke',
            fields: [
              defineField({ name: 'href', title: 'URL', type: 'url' }),
            ],
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Intern lenke (person i HEH)',
            fields: [
              defineField({
                name: 'reference',
                title: 'Person',
                type: 'reference',
                to: [{ type: 'biography' }],
              }),
            ],
          },
        ],
      },
    },
    // Inline image in body text
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
        defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
      ],
    },
  ]
}
