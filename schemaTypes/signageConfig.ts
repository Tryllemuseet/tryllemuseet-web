import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'signageConfig',
  title: 'Infoskjerm – konfigurasjon',
  type: 'document',
  fields: [
    defineField({
      name: 'qrUrl',
      title: 'QR-kode URL',
      type: 'url',
      description: 'URL QR-koden på skjermen peker til',
      initialValue: 'https://tryllemuseet.no',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'openingHours',
      title: 'Åpningstider (fritekst)',
      type: 'string',
      initialValue: 'Søndager kl. 13:00 – 16:00',
    }),
    defineField({
      name: 'showTime',
      title: 'Mini-show tidspunkt',
      type: 'string',
      initialValue: 'Kl. 14:00 — presis',
    }),
    defineField({
      name: 'priceAdult',
      title: 'Pris voksen (kr)',
      type: 'number',
      initialValue: 50,
    }),
    defineField({
      name: 'priceChild',
      title: 'Pris barn (kr)',
      type: 'number',
      initialValue: 20,
    }),
    defineField({
      name: 'quoteCycleSecs',
      title: 'Sitat-bytte hvert X sekund',
      type: 'number',
      initialValue: 9,
      validation: Rule => Rule.min(5).max(60),
    }),
    defineField({
      name: 'memberQrUrl',
      title: 'Bli-med QR URL',
      type: 'url',
      description: 'URL for «Bli med»-QR-koden på skjermen.',
      initialValue: 'https://tryllemuseet.no/blimedlem',
    }),
    defineField({
      name: 'overlayPanelSecs',
      title: 'Infopanel — visningsvarighet (sekunder)',
      type: 'number',
      description: 'Hvor lenge hvert infopanel vises over videoen.',
      initialValue: 18,
      validation: Rule => Rule.min(8).max(60),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Infoskjerm – konfigurasjon' }
    },
  },
})
