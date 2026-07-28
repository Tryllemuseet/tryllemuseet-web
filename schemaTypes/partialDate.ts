import { defineType, defineField } from 'sanity'

export const partialDate = defineType({
  name: 'partialDate',
  title: 'Dato',
  type: 'object',
  description: 'Støtter både eksakt dato og bare årstall, som er det vanligste for eldre biografier.',
  fields: [
    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      validation: R => R.required().integer().min(1400).max(2100),
    }),
    defineField({
      name: 'month',
      title: 'Måned (valgfritt)',
      type: 'number',
      validation: R => R.integer().min(1).max(12),
    }),
    defineField({
      name: 'day',
      title: 'Dag (valgfritt)',
      type: 'number',
      validation: R => R.integer().min(1).max(31),
    }),
    defineField({
      name: 'circa',
      title: 'Omtrentlig (ca.)',
      type: 'boolean',
      initialValue: false,
      description: 'Kryss av hvis året/datoen er usikker eller anslått.',
    }),
  ],
  preview: {
    select: { year: 'year', month: 'month', day: 'day', circa: 'circa' },
    prepare({ year, month, day, circa }: { year?: number; month?: number; day?: number; circa?: boolean }) {
      if (!year) return { title: '(uten dato)' }
      const parts = [year]
      if (month) parts.unshift(day ? `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.` : `${String(month).padStart(2, '0')}.`)
      const title = (circa ? 'ca. ' : '') + parts.join('')
      return { title }
    },
  },
})
