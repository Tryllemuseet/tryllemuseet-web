// schemaTypes/tvAppearance.ts
import { defineType, defineField } from 'sanity'

export const tvAppearance = defineType({
  name: 'tvAppearance',
  title: 'TV-opptreden',
  type: 'document',
  icon: () => '📺',
  fields: [

    // ── 1. TILKNYTNING ────────────────────────────────────────────
    defineField({
      name: 'magician',
      title: 'Magiker',
      type: 'reference',
      to: [{ type: 'biography' }],
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: {
        source: (doc: any) => {
          const name = doc.magician?.name ?? 'ukjent'
          const show = doc.show ?? 'show'
          const year = doc.year ?? ''
          return `${name}-${show}-${year}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        },
        maxLength: 96,
      },
      validation: R => R.required(),
    }),

    // ── 2. PROGRAM ────────────────────────────────────────────────
    defineField({
      name: 'show',
      title: 'TV-program',
      type: 'string',
      options: {
        list: [
          { title: 'Norske Talenter',         value: 'norske-talenter'    },
          { title: 'Talang (Sverige)',         value: 'talang'             },
          { title: 'Penn & Teller: Fool Us',  value: 'fool-us'            },
          { title: 'Danmark har Talent',      value: 'danmark-har-talent' },
          { title: 'Talent Suomi (Finland)',  value: 'talent-suomi'       },
          { title: "Britain's Got Talent",    value: 'bgt'                },
          { title: 'Das Supertalent',         value: 'das-supertalent'    },
          { title: 'Annet',                   value: 'annet'              },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    }),

    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      validation: R => R.required().min(1990).max(2100),
    }),

    defineField({
      name: 'season',
      title: 'Sesong',
      type: 'number',
      description: 'F.eks. 10',
    }),

    defineField({
      name: 'episode',
      title: 'Episode',
      type: 'number',
      description: 'F.eks. 4',
    }),

    defineField({
      name: 'episodeTitle',
      title: 'Episodetittel',
      type: 'string',
      description: "F.eks. \"We've Got a Raccoon Problem\"",
    }),

    // ── 4. RESULTAT ───────────────────────────────────────────────
    defineField({
      name: 'result',
      title: 'Resultat',
      type: 'string',
      options: {
        list: [
          { title: '✅ Fooled Us',          value: 'fooled'        },
          { title: '🥇 Vinner',             value: 'winner'        },
          { title: '🥈 2. plass',           value: 'second'        },
          { title: '🥉 3. plass',           value: 'third'         },
          { title: '🏅 Finalist',           value: 'finalist'      },
          { title: '⭐ Gullknapp',          value: 'golden-buzzer' },
          { title: '🎯 Semifinalist',       value: 'semifinalist'  },
          { title: '✖️ Not Fooled',         value: 'not_fooled'    },
          { title: '📋 Deltaker',           value: 'participant'   },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    }),

    // ── 5. INNHOLD ────────────────────────────────────────────────
    defineField({
      name: 'description',
      title: 'Beskrivelse av opptredenen',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Hva magikeren gjorde på scenen. Ingen avsløring av metoder.',
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
      description: 'YouTube, NRK eller annen videolenke',
    }),

    // ── 6. REDAKSJONELT ──────────────────────────────────────────
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
      title: 'År (nyest først)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Program (A–Å)',
      name: 'showAsc',
      by: [{ field: 'show', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      magicianName: 'magician.name',
      show:         'show',
      year:         'year',
      result:       'result',
      media:        'featuredImage',
    },
    prepare({ magicianName, show, year, result, media }: {
      magicianName?: string; show?: string; year?: number
      result?: string; media?: unknown
    }) {
      const resultEmoji: Record<string, string> = {
        fooled: '✅', winner: '🥇', second: '🥈', third: '🥉',
        finalist: '🏅', 'golden-buzzer': '⭐', semifinalist: '🎯',
        not_fooled: '✖️', participant: '📋',
      }
      const showLabels: Record<string, string> = {
        'norske-talenter':    'Norske Talenter',
        'talang':             'Talang',
        'fool-us':            'Penn & Teller: Fool Us',
        'danmark-har-talent': 'Danmark har Talent',
        'talent-suomi':       'Talent Suomi',
        'bgt':                "Britain's Got Talent",
        'das-supertalent':    'Das Supertalent',
        'annet':              'Annet',
      }
      const catEmoji = show === 'fool-us' ? '🎯' : '🏆'
      const showLabel = show ? (showLabels[show] ?? show) : '?'
      const nameLabel = magicianName ?? '(ikke koblet)'
      return {
        title:    `${catEmoji} ${nameLabel} — ${showLabel}`,
        subtitle: `${year ?? ''} ${resultEmoji[result ?? ''] ?? ''}`,
        media,
      }
    },
  },
})
