import { defineType, defineField } from 'sanity'
import { richBlockContent } from './richBlockContent'

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
      of: richBlockContent([
        { title: 'Normaltekst', value: 'normal' },
        { title: 'Overskrift 3', value: 'h3' },
        { title: 'Sitat', value: 'blockquote' },
      ]),
    }),
  ],
  preview: {
    select: { title: 'heading' },
  },
})
