// schemaTypes/worldRecordTrick.ts
import { defineType, defineField } from 'sanity'

export const worldRecordTrick = defineType({
  name: 'worldRecordTrick',
  title: 'Verdens mest… (oppføring)',
  type: 'document',
  icon: () => '🏆',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
      description: 'Skjul oppføringen uten å slette den. Standard: på.',
    }),

    // ── 1. KATEGORI ──────────────────────────────────────────────
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: '💀 Verdens farligste',        value: 'farligste' },
          { title: '🕰️ Verdens eldste',            value: 'eldste' },
          { title: '🇳🇴 Verdens mest norske bidrag', value: 'norske' },
          { title: '🔁 Verdens mest kopierte',     value: 'kopierte' },
          { title: '💰 Verdens dyreste illusjoner', value: 'dyreste' },
          { title: '⚡ Verdens mest omdiskuterte',  value: 'omdiskuterte' },
        ],
      },
      validation: R => R.required(),
    }),

    // ── 2. INNHOLD ───────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. «Kulefangst-trikset», «Davidos Guinness-rekord»',
      validation: R => R.required(),
    }),

    defineField({
      name: 'teaserText',
      title: 'Teaser (kort, dramatisk)',
      type: 'text',
      rows: 2,
      validation: R => R.required(),
    }),

    defineField({
      name: 'fullStory',
      title: 'Full historie',
      type: 'array',
      of: [{ type: 'block' }],
      validation: R => R.required(),
    }),

    defineField({
      name: 'relatedPerson',
      title: 'Relatert person i registeret (valgfritt)',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Kobler til f.eks. Davido eller Finn Jon sin biografiside, hvis relevant.',
    }),

    defineField({
      name: 'sources',
      title: 'Kilder',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Én kilde per linje, f.eks. «Wikipedia — Bullet catch» eller en URL.',
    }),

    defineField({
      name: 'needsVerification',
      title: 'Trenger verifisering før publisering',
      type: 'boolean',
      initialValue: false,
      description: 'Skru på hvis en påstand i teksten ikke er 100% bekreftet ennå.',
    }),

    // ── 3. SORTERING ─────────────────────────────────────────────
    defineField({
      name: 'order',
      title: 'Rekkefølge innen kategori',
      type: 'number',
    }),

  ],

  preview: {
    select: {
      title: 'title',
      category: 'category',
      isVisible: 'isVisible',
      needsVerification: 'needsVerification',
    },
    prepare({ title, category, isVisible, needsVerification }: { title?: string; category?: string; isVisible?: boolean; needsVerification?: boolean }) {
      const parts = [
        category,
        isVisible === false ? '⚪ Skjult' : null,
        needsVerification ? '⚠️ Må verifiseres' : null,
      ].filter(Boolean)
      return {
        title: title ?? '(uten tittel)',
        subtitle: parts.join(' · '),
      }
    },
  },
})
