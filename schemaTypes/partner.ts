// schemaTypes/partner.ts
export const partner = {
  name:  'partner',
  title: 'Partner / Sponsor',
  type:  'document',
  fields: [
    {
      name:       'name',
      title:      'Navn',
      type:       'string',
      validation: (R: any) => R.required(),
    },
    {
      name:  'logo',
      title: 'Logo',
      type:  'image',
      options: { hotspot: false },
      description: 'Last opp SVG eller PNG med transparent bakgrunn.',
    },
    {
      name:  'url',
      title: 'Nettside',
      type:  'url',
    },
    {
      name:    'category',
      title:   'Kategori',
      type:    'string',
      options: {
        list: [
          { title: 'Offentlig støtte',  value: 'public' },
          { title: 'Privat støtte',     value: 'private' },
          { title: 'Fagorganisasjon',   value: 'org' },
        ],
        layout: 'radio',
      },
      validation: (R: any) => R.required(),
    },
    {
      name:        'order',
      title:       'Rekkefølge',
      type:        'number',
      description: 'Lavere tall vises først.',
    },
  ],
  preview: {
    select:  { title: 'name', subtitle: 'category', media: 'logo' },
    prepare: ({ title, subtitle, media }: any) => ({
      title,
      subtitle: { public: 'Offentlig støtte', private: 'Privat støtte', org: 'Fagorganisasjon' }[subtitle as string] ?? subtitle,
      media,
    }),
  },
}
