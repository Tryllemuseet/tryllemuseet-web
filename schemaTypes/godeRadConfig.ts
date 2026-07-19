import { defineField, defineType } from 'sanity'

export const godeRadConfig = defineType({
  name: 'godeRadConfig',
  title: 'Gode råd (Lær et triks)',
  type: 'document',
  icon: () => '💡',
  description:
    'Delt tekst i «Gode råd»-boksen på hver triks-side under Lær et triks. Opprett bare ett dokument av denne typen.',
  __experimental_actions: ['update', 'publish'],
  fields: [

    defineField({ name: 'barnHeading', title: 'Overskrift — til barn', type: 'string', initialValue: 'Til deg som øver' }),
    defineField({
      name: 'barnRad',
      title: 'Råd til barn',
      type: 'array',
      of: [{ type: 'text', rows: 2 }],
    }),

    defineField({ name: 'voksneHeading', title: 'Overskrift — til voksne', type: 'string', initialValue: 'Til voksne' }),
    defineField({
      name: 'voksneRad',
      title: 'Råd til voksne',
      type: 'array',
      of: [{ type: 'text', rows: 2 }],
    }),

  ],

  preview: {
    prepare: () => ({ title: 'Gode råd (Lær et triks)' }),
  },
})
