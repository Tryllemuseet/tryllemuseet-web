import { defineType, defineField } from 'sanity'

export const sourceItem = defineType({
  name: 'sourceItem',
  title: 'Kilde',
  type: 'object',
  icon: () => '🔗',
  fields: [
    defineField({
      name: 'label',
      title: 'Kildebeskrivelse',
      type: 'string',
      description: 'F.eks. "Wikipedia — Harry Houdini (norsk)"',
      validation: R => R.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Valgfri. La stå tom for bøker uten nettlenke.',
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'url' },
  },
})
