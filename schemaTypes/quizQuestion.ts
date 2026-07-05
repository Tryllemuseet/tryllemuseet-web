// schemaTypes/quizQuestion.ts
import { defineType, defineField } from 'sanity'

const DIFFICULTY_LABELS: Record<string, string> = {
  lett:      '🟢 Lett',
  middels:   '🟡 Middels',
  vanskelig: '🔴 Vanskelig',
}

export const quizQuestion = defineType({
  name: 'quizQuestion',
  title: 'Quiz: Spørsmål',
  type: 'document',
  icon: () => '❓',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul spørsmålet fra quizen uten å slette det. Standard: på.',
    }),

    // ── 1. SPØRSMÅL ───────────────────────────────────────────────
    defineField({
      name: 'question',
      title: 'Spørsmål',
      type: 'text',
      rows: 3,
      validation: R => R.required(),
    }),

    defineField({
      name: 'image',
      title: 'Bilde (valgfritt)',
      type: 'image',
      options: { hotspot: true },
      description: 'Vises over spørsmålet — f.eks. et portrett eller en gjenstand.',
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),

    // ── 2. SVARALTERNATIVER ───────────────────────────────────────
    defineField({
      name: 'answers',
      title: 'Svaralternativer',
      type: 'array',
      description: '2–4 alternativer. Nøyaktig ett skal være markert som riktig. Rekkefølgen stokkes automatisk på nettsiden.',
      of: [{
        type: 'object',
        name: 'answer',
        fields: [
          defineField({ name: 'text', title: 'Svartekst', type: 'string', validation: R => R.required() }),
          defineField({ name: 'isCorrect', title: 'Riktig svar', type: 'boolean', initialValue: false }),
        ],
        preview: {
          select: { title: 'text', isCorrect: 'isCorrect' },
          prepare({ title, isCorrect }: { title?: string; isCorrect?: boolean }) {
            return {
              title: title ?? '(uten tekst)',
              subtitle: isCorrect ? '✅ Riktig svar' : '',
            }
          },
        },
      }],
      validation: R => R.required().min(2).max(4).custom(
        (answers?: { isCorrect?: boolean }[]) => {
          const correct = (answers ?? []).filter(a => a.isCorrect === true).length
          if (correct !== 1) return 'Nøyaktig ett alternativ må være markert som riktig svar.'
          return true
        }
      ),
    }),

    // ── 3. LÆRINGSINNHOLD ─────────────────────────────────────────
    defineField({
      name: 'explanation',
      title: 'Forklaring («Visste du at …»)',
      type: 'text',
      rows: 3,
      description: 'Vises etter at man har svart — uansett om svaret var riktig eller galt. Bruk anledningen til å lære bort noe!',
    }),

    defineField({
      name: 'learnMoreUrl',
      title: 'Les mer-lenke',
      type: 'string',
      description: 'Intern sti til relatert innhold på nettsiden, f.eks. /tryllehistorie/norske-legender/henrik-ibsen.',
    }),

    defineField({
      name: 'learnMoreLabel',
      title: 'Les mer-tekst',
      type: 'string',
      description: 'Lenketekst, f.eks. «Les mer om Henrik Ibsen». Standard: «Les mer».',
    }),

    // ── 4. KATEGORISERING ─────────────────────────────────────────
    defineField({
      name: 'difficulty',
      title: 'Vanskelighetsgrad',
      type: 'string',
      options: {
        list: [
          { title: 'Lett (barn og nybegynnere)',      value: 'lett'      },
          { title: 'Middels (hele familien)',          value: 'middels'   },
          { title: 'Vanskelig (entusiaster og voksne)', value: 'vanskelig' },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    }),

    defineField({
      name: 'themes',
      title: 'Tema',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'quizTheme' }] }],
      description: 'Ett eller flere tema. Spørsmål uten tema er bare med i «Alle tema».',
    }),

  ],

  preview: {
    select: {
      title: 'question',
      difficulty: 'difficulty',
      theme0: 'themes.0.title',
      media: 'image',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({ title, difficulty, theme0, media }: { title?: string; difficulty?: string; theme0?: string; media?: any }) {
      const parts = [difficulty ? DIFFICULTY_LABELS[difficulty] ?? difficulty : null, theme0].filter(Boolean)
      return {
        title: title ?? '(uten spørsmål)',
        subtitle: parts.join(' · '),
        media,
      }
    },
  },
})
