// schemaTypes/partner.ts
export const partner = {
  name:  'partner',
  title: 'Partner / Sponsor',
  type:  'document',
  fields: [
    {
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    },
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
      name:        'description',
      title:       'Kort beskrivelse',
      type:        'text',
      rows:        2,
      description: 'Én til to setninger om partneren. Vises på Om oss-siden.',
    },
    {
      name:  'url',
      title: 'Nettside',
      type:  'url',
    },
    {
      name:        'memberBenefit',
      title:       'Medlemsfordel',
      type:        'array',
      of:          [{ type: 'block' }],
      description: 'Hva museets medlemmer får hos denne partneren. Vises på Besøk oss- og Om oss-sidene.',
    },
    {
      name:    'category',
      title:   'Kategori',
      type:    'string',
      options: {
        list: [
          { title: 'Offentlig støtte',    value: 'public' },
          { title: 'Privat støtte',      value: 'private' },
          { title: 'Fagorganisasjon',    value: 'org' },
          { title: 'Samarbeidspartner',  value: 'samarbeidspartner' },
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
      subtitle: { public: 'Offentlig støtte', private: 'Privat støtte', org: 'Fagorganisasjon', samarbeidspartner: 'Samarbeidspartner' }[subtitle as string] ?? subtitle,
      media,
    }),
  },
}
