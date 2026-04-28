import { defineType, defineField } from 'sanity'

export const biography = defineType({
  name: 'biography',
  title: 'Magiker — Hvem er hvem',
  type: 'document',
  icon: () => '🪄',
  fields: [

    // ── 1. GRUNNINFO ──────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Fullt navn',
      type: 'string',
      description: 'F.eks. "Albertsen, Trond (Chriss Chrissel)"',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'name', maxLength: 80 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'artistName',
      title: 'Kunstnernavn',
      type: 'string',
      description: 'Kun kunstnernavnet isolert, f.eks. "Chriss Chrissel"',
    }),
    defineField({
      name: 'nationality',
      title: 'Nasjonalitet',
      type: 'string',
      initialValue: 'Norsk',
    }),
    defineField({
      name: 'years',
      title: 'Leveår / aktiv periode',
      type: 'string',
      description: 'F.eks. "1912–1995" eller "f. 1961"',
    }),
    defineField({
      name: 'featured',
      title: 'Fremhev øverst i listen',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Emneord',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Norsk',          value: 'norsk'          },
          { title: 'Internasjonal',  value: 'internasjonal'  },
          { title: 'Profesjonell',   value: 'profesjonell'   },
          { title: 'Amatør',        value: 'amatør'         },
          { title: 'Illusjonist',    value: 'illusjonist'    },
          { title: 'Escapist',       value: 'escapist'       },
          { title: 'Mentalist',      value: 'mentalist'      },
          { title: 'Buktaler',       value: 'buktaler'       },
          { title: 'Close-up',       value: 'close-up'       },
          { title: 'Barneshowet',    value: 'barneshow'      },
          { title: 'NM-vinner',      value: 'nm-vinner'      },
        ],
        layout: 'tags',
      },
    }),

    // ── 2. BILDER ─────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
          description: 'Beskriv bildet for skjermlesere',
        }),
        defineField({
          name: 'caption',
          title: 'Bildetekst',
          type: 'string',
        }),
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
          defineField({ name: 'alt',     title: 'Alt-tekst',   type: 'string' }),
          defineField({ name: 'caption', title: 'Bildetekst',  type: 'string' }),
        ],
      }],
    }),

    // ── 3. TEKST ──────────────────────────────────────────────────
    defineField({
      name: 'shortBio',
      title: 'Kortbiografi',
      type: 'text',
      rows: 4,
      description: 'Vises i listevisning. Maks 280 tegn.',
      validation: R => R.max(280),
    }),
    defineField({
      name: 'fullBio',
      title: 'Fullstendig biografi',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Full tekst med avsnitt. Vises på detaljsiden.',
    }),

    // ── 4. LENKER ─────────────────────────────────────────────────
    defineField({
      name: 'links',
      title: 'Lenker',
      type: 'array',
      description: 'Wikipedia, egen nettside, YouTube, Facebook osv.',
      of: [{
        type: 'object',
        name: 'link',
        title: 'Lenke',
        fields: [
          defineField({
            name: 'label',
            title: 'Lenketekst',
            type: 'string',
            description: 'F.eks. "Wikipedia", "Offisiell nettside", "YouTube-kanal"',
            validation: R => R.required(),
          }),
          defineField({
            name: 'url',
            title: 'URL',
            type: 'url',
            validation: R => R.required(),
          }),
          defineField({
            name: 'type',
            title: 'Type lenke',
            type: 'string',
            options: {
              list: [
                { title: 'Wikipedia',       value: 'wikipedia'  },
                { title: 'Nettside',        value: 'website'    },
                { title: 'YouTube',         value: 'youtube'    },
                { title: 'Facebook',        value: 'facebook'   },
                { title: 'Instagram',       value: 'instagram'  },
                { title: 'Annet',           value: 'other'      },
              ],
            },
          }),
        ],
        preview: {
          select: { title: 'label', subtitle: 'url' },
        },
      }],
    }),

    // ── 5. KILDER ─────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Kilder',
      type: 'array',
      of: [{ type: 'sourceItem' }],
    }),

    // ── 6. REDAKSJONELT ──────────────────────────────────────────
    defineField({
      name: 'lastVerified',
      title: 'Sist verifisert / oppdatert',
      type: 'date',
      description: 'Når ble denne biografien sist sjekket mot aktuelle kilder?',
    }),
    defineField({
      name: 'needsUpdate',
      title: 'Trenger oppdatering',
      type: 'boolean',
      initialValue: false,
      description: 'Merk hvis biografien er utdatert og bør sjekkes',
    }),
    defineField({
      name: 'editorNote',
      title: 'Redaksjonell merknad (intern)',
      type: 'text',
      rows: 2,
      description: 'Vises ikke på nettsiden. Notater til redaktørene.',
    }),

  ],

  orderings: [
    {
      title: 'Navn (A–Å)',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Trenger oppdatering',
      name: 'needsUpdate',
      by: [{ field: 'needsUpdate', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title:    'name',
      subtitle: 'years',
      media:    'mainImage',
      needs:    'needsUpdate',
    },
    prepare({ title, subtitle, media, needs }) {
      return {
        title:    (needs ? '⚠️ ' : '') + (title ?? '(uten navn)'),
        subtitle: subtitle ?? '',
        media:    media,
      }
    },
  },
})
