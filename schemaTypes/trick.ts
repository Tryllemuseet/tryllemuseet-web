// schemaTypes/trick.ts
import { defineType, defineField } from 'sanity'

const DIFFICULTY_LABELS: Record<string, string> = {
  enkel: '🟢 Enkel',
  middels: '🟡 Litt vanskeligere',
}

export const trick = defineType({
  name: 'trick',
  title: 'Triks (Lær et triks)',
  type: 'document',
  icon: () => '🪄',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
      description: 'Skjul trikset fra /barn/laer-et-triks uten å slette det. Standard: på.',
    }),

    // ── 1. GRUNNINFO ─────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. «Den forsvinnende mynten»',
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
      name: 'difficulty',
      title: 'Vanskelighetsgrad',
      type: 'string',
      options: {
        list: [
          { title: 'Enkel', value: 'enkel' },
          { title: 'Litt vanskeligere', value: 'middels' },
        ],
        layout: 'radio',
      },
      initialValue: 'enkel',
      validation: R => R.required(),
    }),

    defineField({
      name: 'shortDescription',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 2,
      description: 'Vises på kortet i oversikten. Én-to setninger.',
      validation: R => R.required(),
    }),

    // ── 2. INNHOLD ───────────────────────────────────────────────
    defineField({
      name: 'materials',
      title: 'Du trenger',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Enkel liste over ting man trenger for å lære trikset, f.eks. «En vanlig kortstokk».',
    }),

    defineField({
      name: 'instructions',
      title: 'Fremgangsmåte (valgfritt)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Fritekst hvis dere vil supplere videoen med skriftlig steg-for-steg. Kan stå tom hvis videoen er nok.',
    }),

    defineField({
      name: 'videoUrl',
      title: 'Video-lenke (YouTube)',
      type: 'url',
      description: 'Full YouTube-lenke. Vises som personvernvennlig innebygd video (youtube-nocookie.com) på siden.',
      validation: R => R.uri({ scheme: ['http', 'https'] }),
    }),

    defineField({
      name: 'externalUrl',
      title: 'Ekstern lenke (alternativ til video)',
      type: 'url',
      description: 'Bruk kun hvis trikset heller peker til en ekstern side (f.eks. en samarbeidspartner) i stedet for video.',
      validation: R => R.uri({ scheme: ['http', 'https'] }),
    }),

    // ── 3. SORTERING ─────────────────────────────────────────────
    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavere tall vises først. Stå tomt hvis rekkefølgen ikke spiller noen rolle.',
    }),

  ],

  preview: {
    select: {
      title: 'title',
      difficulty: 'difficulty',
      isVisible: 'isVisible',
    },
    prepare({ title, difficulty, isVisible }: { title?: string; difficulty?: string; isVisible?: boolean }) {
      const parts = [
        difficulty ? DIFFICULTY_LABELS[difficulty] ?? difficulty : null,
        isVisible === false ? '⚪ Skjult' : null,
      ].filter(Boolean)
      return {
        title: title ?? '(uten tittel)',
        subtitle: parts.join(' · '),
      }
    },
  },
})
