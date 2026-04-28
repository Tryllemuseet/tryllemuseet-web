import { defineType, defineField } from 'sanity'

export const contentSection = defineType({
  name: 'contentSection',
  title: 'Innholdsseksjon',
  type: 'object',
  icon: () => '📝',
  fields: [
    defineField({
      name: 'heading',
      title: 'Overskrift',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'body',
      title: 'Brødtekst',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { title: 'heading' },
  },
})
