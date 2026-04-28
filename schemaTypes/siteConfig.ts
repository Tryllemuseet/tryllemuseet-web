import { defineType, defineField } from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Globale innstillinger',
  type: 'document',
  icon: () => '⚙️',
  // Singleton — kun ett dokument
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'siteName',    title: 'Museumsnavn',  type: 'string', initialValue: 'Tryllemuseet' }),
    defineField({ name: 'siteTagline', title: 'Slagord',      type: 'string', initialValue: 'Norges minste, merkeligste og mest magiske museum' }),
    defineField({
      name: 'address', title: 'Adresse', type: 'text', rows: 2,
      initialValue: 'Årvollveien 35\n0590 Oslo',
    }),
    defineField({
      name: 'openingHours', title: 'Åpningstider',
      type: 'array', of: [{ type: 'block' }],
    }),
    defineField({ name: 'email',     title: 'E-post',     type: 'string' }),
    defineField({ name: 'phone',     title: 'Telefon',    type: 'string' }),
    defineField({ name: 'facebook',  title: 'Facebook',   type: 'url' }),
    defineField({ name: 'instagram', title: 'Instagram',  type: 'url' }),
    defineField({ name: 'youtube',   title: 'YouTube',    type: 'url' }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
