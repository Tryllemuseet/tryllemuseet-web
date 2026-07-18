// schemaTypes/magicOrganization.ts
// Schema for magic organizations (e.g. Magiske Cirkel Norge, Den Magiske Ring)

import { defineField, defineType } from 'sanity'
import { richBlockContent } from './richBlockContent'

export default defineType({
  name: 'magicOrganization',
  title: 'Trylleforening',
  type: 'document',
  orderings: [
    {
      title: 'Navn A–Å',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
  fields: [
    // ─── Visibility ───────────────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
      description: 'Slå av for å skjule foreningen uten å slette den.',
    }),

    // ─── Identity ─────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'abbreviation',
      title: 'Forkortelse',
      type: 'string',
      description: 'F.eks. «MCN» eller «DMR»',
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Land',
      type: 'string',
      description: 'F.eks. «Norge», «Danmark»',
    }),
    defineField({
      name: 'foundedYear',
      title: 'Grunnlagt (år)',
      type: 'number',
    }),
    defineField({
      name: 'dissolutionYear',
      title: 'Oppløst (år)',
      type: 'number',
      description: 'Fyll kun inn hvis foreningen er nedlagt.',
    }),
    defineField({
      name: 'website',
      title: 'Nettside',
      type: 'url',
      description: 'Ekstern lenke — peker til foreningens egne sider for nåtidsinfo.',
    }),

    // ─── Ingress ──────────────────────────────────────────────────────────────
    defineField({
      name: 'ingress',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      description: 'Kort tekst til listevisning og søkeresultater. Maks 280 tegn.',
      validation: (Rule) => Rule.max(280),
    }),

    // ─── Logo history ─────────────────────────────────────────────────────────
    defineField({
      name: 'logoHistory',
      title: 'Logohistorikk',
      type: 'array',
      description: 'Legg til logoer i kronologisk rekkefølge. Nyeste vises som aktiv logo.',
      of: [
        {
          type: 'object',
          title: 'Logo',
          preview: {
            select: { title: 'year', media: 'logo' },
            prepare({ title, media }) {
              return { title: title ? `${title}` : 'Ukjent år', media }
            },
          },
          fields: [
            defineField({
              name: 'year',
              title: 'År',
              type: 'number',
              description: 'Året logoen ble tatt i bruk.',
            }),
            defineField({
              name: 'logo',
              title: 'Logo',
              type: 'image',
              options: { hotspot: false },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt-tekst',
                  type: 'string',
                  description: 'F.eks. «MCN-logo 1978»',
                }),
              ],
            }),
            defineField({
              name: 'note',
              title: 'Merknad',
              type: 'string',
              description: 'F.eks. «Redesign til jubileet» eller «Første offisielle logo»',
            }),
          ],
        },
      ],
    }),

    // ─── Main body text ───────────────────────────────────────────────────────
    defineField({
      name: 'body',
      title: 'Brødtekst',
      type: 'array',
      description: 'Historikk, bakgrunn og relasjon til museet. Rik tekst med avsnitt og lenker.',
      of: richBlockContent(),
    }),

    // ─── Key people ───────────────────────────────────────────────────────────
    defineField({
      name: 'keyPeople',
      title: 'Sentrale skikkelser',
      type: 'array',
      description: 'Koble til personer i Hvem er hvem-registeret. Legg til én og én.',
      of: [
        {
          type: 'object',
          title: 'Person',
          preview: {
            select: {
              name: 'person.name',
              role: 'role',
              media: 'person.image',
            },
            prepare({ name, role }) {
              return { title: name ?? 'Ukjent person', subtitle: role ?? '' }
            },
          },
          fields: [
            defineField({
              name: 'person',
              title: 'Person',
              type: 'reference',
              to: [{ type: 'biography' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Rolle / funksjon',
              type: 'string',
              description: 'F.eks. «Grunnlegger», «Formann 1952–1960», «Æresmedlem»',
            }),
            defineField({
              name: 'years',
              title: 'Periode',
              type: 'string',
              description: 'F.eks. «1952–1960» eller «fra 1985»',
            }),
          ],
        },
      ],
    }),

    // ─── Sub-articles ─────────────────────────────────────────────────────────
    defineField({
      name: 'articles',
      title: 'Underartikler',
      type: 'array',
      description:
        'Dypere artikler om spesifikke tema (f.eks. «Ledere gjennom tidene», «Stevner og konkurranser»). Vises som egne seksjoner eller undersider.',
      of: [
        {
          type: 'object',
          title: 'Underartikkel',
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title ?? 'Uten tittel' }
            },
          },
          fields: [
            defineField({
              name: 'title',
              title: 'Tittel',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'slug',
              title: 'URL-slug',
              type: 'slug',
              options: { source: 'title' },
              description: 'Brukes hvis underartikkelen får egen URL.',
            }),
            defineField({
              name: 'ingress',
              title: 'Ingress',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'body',
              title: 'Brødtekst',
              type: 'array',
              of: richBlockContent([
                { title: 'Normaltekst', value: 'normal' },
                { title: 'Overskrift 3', value: 'h3' },
                { title: 'Sitat', value: 'blockquote' },
              ]),
            }),
            // People linked specifically to this sub-article
            defineField({
              name: 'relatedPeople',
              title: 'Tilknyttede personer',
              type: 'array',
              description: 'Personer fra HEH-registeret som er relevante for denne artikkelen.',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'person',
                      title: 'Person',
                      type: 'reference',
                      to: [{ type: 'biography' }],
                    }),
                    defineField({
                      name: 'note',
                      title: 'Merknad',
                      type: 'string',
                      description: 'F.eks. «Formann 1952–1960»',
                    }),
                  ],
                  preview: {
                    select: { name: 'person.name', note: 'note' },
                    prepare({ name, note }) {
                      return { title: name ?? 'Ukjent', subtitle: note ?? '' }
                    },
                  },
                },
              ],
            }),
            defineField({
              name: 'sources',
              title: 'Kilder',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Lenketekst', type: 'string' }),
                    defineField({ name: 'url', title: 'URL', type: 'url' }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'url' },
                  },
                },
              ],
            }),
          ],
        },
      ],
    }),

    // ─── Gallery ──────────────────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Bildegalleri',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
            defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
            defineField({ name: 'year', title: 'År', type: 'number' }),
          ],
        },
      ],
    }),

    // ─── Sources ──────────────────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Kilder',
      type: 'array',
      description: 'Lenker til Wikipedia, arkiver, nasjonalbiblioteket osv.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Lenketekst', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        },
      ],
    }),

    // ─── Internal notes ───────────────────────────────────────────────────────
    defineField({
      name: 'internalNotes',
      title: 'Interne notater',
      type: 'text',
      rows: 3,
      description: 'Vises ikke på nettsiden.',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'country',
      media: 'logoHistory.0.logo',
    },
    prepare({ title, subtitle, media }) {
      return { title: title ?? 'Uten navn', subtitle: subtitle ?? '', media }
    },
  },
})
