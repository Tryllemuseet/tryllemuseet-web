// schemaTypes/historicalClip.ts
import { defineType, defineField } from 'sanity'

export const historicalClip = defineType({
  name: 'historicalClip',
  title: 'Historisk TV-opptak',
  type: 'document',
  icon: () => '📼',
  fields: [

    // ── 1. TILKNYTNING ────────────────────────────────────────────
    defineField({
      name: 'magician',
      title: 'Magiker / person',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Koble til biografiregisteret. Kan være tom for historiske begivenheter uten én navngitt utøver.',
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: R => R.required(),
    }),

    // ── 2. GRUNNINFO ─────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. "Egelo — Melodi Grand Prix 1966" eller "MCN Magisk Festival 1976"',
      validation: R => R.required(),
    }),

    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      validation: R => R.min(1900).max(2100),
    }),

    defineField({
      name: 'broadcaster',
      title: 'Kanal / kringkaster',
      type: 'string',
      options: {
        list: [
          { title: 'NRK',           value: 'nrk'      },
          { title: 'TV 2',          value: 'tv2'      },
          { title: 'Filmavisen',    value: 'filmavisen'},
          { title: 'Annet',         value: 'annet'    },
          { title: 'Ukjent',        value: 'ukjent'   },
        ],
      },
    }),

    defineField({
      name: 'show',
      title: 'Program / kontekst',
      type: 'string',
      description: 'F.eks. "Lørdagskveld med Erik Bye", "Kalle og Molo", "Frøken Norge"',
    }),

    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'TV-opptreden',       value: 'tv_show'      },
          { title: 'Underholdningsprogram', value: 'entertainment'},
          { title: 'Barneprogram',       value: 'children'     },
          { title: 'Nyheter / reportasje', value: 'news'       },
          { title: 'Mesterskap / konkurranse', value: 'competition'},
          { title: 'Historisk begivenhet', value: 'historical' },
          { title: 'Konsert / show',     value: 'show'         },
        ],
        layout: 'radio',
      },
    }),

    // ── 3. INNHOLD ────────────────────────────────────────────────
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Kontekstuell beskrivelse av opptaket. Ingen avsløring av triks.',
    }),

    defineField({
      name: 'featuredImage',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt',     title: 'Alt-tekst',  type: 'string' }),
        defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
      ],
    }),

    defineField({
      name: 'videoUrl',
      title: 'Videolenke',
      type: 'url',
      description: 'YouTube, NRK TV eller annet. Ved tidskode: lim inn komplett URL med &t=',
    }),

    defineField({
      name: 'videoUrlAlt',
      title: 'Alternativ videolenke',
      type: 'url',
      description: 'Bruk hvis opptaket finnes på flere steder / tidspunkter i samme video.',
    }),

    defineField({
      name: 'source',
      title: 'Kilde / samling',
      type: 'string',
      description: 'F.eks. "Egelos videosamling (@Egelosvideosamling)", "NRK Arkiv", "Nasjonalbiblioteket"',
    }),

    // ── 4. REDAKSJONELT ──────────────────────────────────────────
    defineField({
      name: 'needsVerification',
      title: 'Lenke bør verifiseres',
      type: 'boolean',
      initialValue: false,
      description: 'Merk hvis videolenken kan peke til feil tidspunkt eller er usikker.',
    }),

    defineField({
      name: 'editorNote',
      title: 'Redaksjonell merknad (intern)',
      type: 'text',
      rows: 2,
      description: 'Vises ikke på nettsiden.',
    }),

  ],

  orderings: [
    {
      title: 'År (eldst først)',
      name: 'yearAsc',
      by: [{ field: 'year', direction: 'asc' }],
    },
    {
      title: 'År (nyest først)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title:    'title',
      year:     'year',
      needs:    'needsVerification',
      media:    'featuredImage',
      magName:  'magician.name',
    },
    prepare({ title, year, needs, media, magName }: {
      title?: string; year?: number; needs?: boolean; media?: unknown; magName?: string
    }) {
      return {
        title:    (needs ? '⚠️ ' : '') + (title ?? '(uten tittel)'),
        subtitle: [magName, year].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
