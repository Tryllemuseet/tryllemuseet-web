// schemaTypes/competitionResult.ts
import { defineType, defineField } from 'sanity'

export const competitionResult = defineType({
  name: 'competitionResult',
  title: 'Konkurranseresultat',
  type: 'document',
  icon: () => '🏅',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
    }),

    // ── 1. PERSON ────────────────────────────────────────────────
    defineField({
      name: 'personName',
      title: 'Navn',
      type: 'string',
      description: 'Fritekst — brukes alltid til visning, selv om personRef er satt.',
      validation: R => R.required(),
    }),

    defineField({
      name: 'personRef',
      title: 'Person i registeret (valgfritt)',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Sett hvis personen finnes i «Magiens Hvem er Hvem»-registeret.',
    }),

    defineField({
      name: 'country',
      title: 'Land',
      type: 'string',
      options: {
        list: [
          { title: 'Norge', value: 'NO' },
          { title: 'Sverige', value: 'SE' },
          { title: 'Danmark', value: 'DK' },
          { title: 'Finland', value: 'FI' },
          { title: 'Island', value: 'IS' },
        ],
      },
      validation: R => R.required(),
    }),

    // ── 2. KONKURRANSE ───────────────────────────────────────────
    defineField({
      name: 'competition',
      title: 'Konkurranse',
      type: 'string',
      options: {
        list: [
          { title: 'FISM (VM)', value: 'fism' },
          { title: 'Nordisk mesterskap', value: 'nordisk' },
          { title: 'Norgesmesterskap (NM)', value: 'nm' },
          { title: 'Annet', value: 'annet' },
        ],
      },
      validation: R => R.required(),
    }),

    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      validation: R => R.required(),
    }),

    defineField({
      name: 'location',
      title: 'Sted',
      type: 'string',
      description: 'F.eks. «Madrid», «Trondheim»',
    }),

    defineField({
      name: 'category',
      title: 'Kategori/disiplin',
      type: 'string',
      description: 'F.eks. «Manipulasjon», «Korttriks», «Scenemagi». Fritekst — varierer for mye mellom kilder til å låses til en liste.',
    }),

    defineField({
      name: 'placement',
      title: 'Resultat/plassering',
      type: 'string',
      description: 'F.eks. «1. plass (Verdensmester)», «2. plass», «Grand Prix»',
      validation: R => R.required(),
    }),

    // ── 3. KILDE ─────────────────────────────────────────────────
    defineField({
      name: 'source',
      title: 'Kilde',
      type: 'string',
      description: 'F.eks. «fism.org/championships/winners» eller «Magiens Hvem er Hvem, Nordheim 2005»',
    }),

  ],

  preview: {
    select: {
      title: 'personName',
      year: 'year',
      competition: 'competition',
      placement: 'placement',
    },
    prepare({ title, year, competition, placement }: { title?: string; year?: number; competition?: string; placement?: string }) {
      return {
        title: `${title ?? '(uten navn)'} — ${year ?? '?'}`,
        subtitle: `${competition ?? ''} · ${placement ?? ''}`,
      }
    },
  },
})
