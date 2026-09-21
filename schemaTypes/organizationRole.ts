// schemaTypes/organizationRole.ts
// Covers both verv (formann/president/kasserer) and æresbevisninger (æresmedlem,
// Sandors Pris, Magiens trofaste riddere osv.) in én gjenbrukbar type, siden de
// er strukturelt identiske (person + organisasjon + tittel + tidspunkt).

import { defineType, defineField } from 'sanity'

export const organizationRole = defineType({
  name: 'organizationRole',
  title: 'Organisasjonsrolle / æresbevisning',
  type: 'document',
  icon: () => '🎖️',
  fields: [
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'needsReview',
      title: 'Trenger gjennomgang',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'person',
      title: 'Person (HEH)',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Kobles her hvis personen finnes i Hvem er hvem-registeret.',
    }),
    defineField({
      name: 'personNameFallback',
      title: 'Navn (fritekst)',
      type: 'string',
      description: 'Brukes når personen ikke finnes i HEH ennå, eller er utenlandsk.',
      validation: (Rule) =>
        Rule.custom((val, context) => {
          const doc = context.document as any
          if (!doc?.person && !val) return 'Enten «Person» eller «Navn (fritekst)» må fylles ut'
          return true
        }),
    }),
    defineField({
      name: 'organization',
      title: 'Organisasjon',
      type: 'reference',
      to: [{ type: 'magicOrganization' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Verv', value: 'verv' },
          { title: 'Æresbevisning', value: 'aeresbevisning' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'roleTitle',
      title: 'Tittel',
      type: 'string',
      description:
        'F.eks. «President», «Formann», «Æresmedlem», «Sandors Pris», «Magiens trofaste ridder».',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'yearFrom',
      title: 'År fra',
      type: 'number',
    }),
    defineField({
      name: 'yearTo',
      title: 'År til',
      type: 'number',
      description: 'La stå tom for engangsutmerkelser (kun ett år).',
    }),
    defineField({
      name: 'country',
      title: 'Land',
      type: 'string',
      initialValue: 'Norge',
    }),
    defineField({
      name: 'note',
      title: 'Merknad',
      type: 'text',
      rows: 3,
      description: 'Fritekst-merknad fra kildematerialet (fotnoter e.l.).',
    }),
    defineField({
      name: 'source',
      title: 'Kilde',
      type: 'reference',
      to: [{ type: 'source' }],
      description:
        'Peker foreløpig mot «source-magiens-hvem-er-hvem-terje-nordheim-2005» — dette source-dokumentet finnes ikke ennå og må opprettes med nøyaktig denne _id-en før referansen kan løses.',
      initialValue: { _ref: 'source-magiens-hvem-er-hvem-terje-nordheim-2005' },
    }),
  ],
  preview: {
    select: {
      title: 'roleTitle',
      subtitle: 'personNameFallback',
      personName: 'person.name',
    },
    prepare({ title, subtitle, personName }: { title?: string; subtitle?: string; personName?: string }) {
      return { title: `${title ?? '(uten tittel)'} — ${personName || subtitle || 'ukjent'}` }
    },
  },
})
