// schemaTypes/siteConfig.ts
import { defineType, defineField } from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Globale innstillinger',
  type: 'document',
  icon: () => '⚙️',
  // Singleton — kun ett dokument
  __experimental_actions: ['update', 'publish'],
  fields: [

    // ─── GENERELT ───────────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Museumsnavn',
      type: 'string',
      initialValue: 'Tryllemuseet',
    }),
    defineField({
      name: 'siteTagline',
      title: 'Slagord',
      type: 'string',
      initialValue: 'Norges minste, merkeligste og mest magiske museum',
    }),

    // ─── KONTAKT ────────────────────────────────────────────────
    defineField({
      name: 'email',
      title: 'E-post',
      type: 'string',
      initialValue: 'post@tryllemuseet.no',
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
    }),

    // ─── ADRESSE ────────────────────────────────────────────────
    defineField({
      name: 'address',
      title: 'Adresse (full)',
      type: 'text',
      rows: 2,
      initialValue: 'Årvollveien 35\n0590 Oslo',
      description: 'Brukes i footer og kontaktside',
    }),
    defineField({
      name: 'addressShort',
      title: 'Adresse (kort)',
      type: 'string',
      initialValue: 'Årvollveien 35, Oslo',
      description: 'Brukes i header-strip og kompakte visninger',
    }),
    defineField({
      name: 'mapUrl',
      title: 'Google Maps-lenke',
      type: 'url',
      initialValue: 'https://maps.google.com/?q=Årvollveien+35,+0590+Oslo',
    }),

    // ─── ÅPNINGSTIDER ───────────────────────────────────────────
    defineField({
      name: 'openingHoursShort',
      title: 'Åpningstider (kort)',
      type: 'string',
      initialValue: 'Søndager 12–16',
      description: 'Brukes i header-strip, footer og hero — f.eks. «Søndager 12–16»',
    }),
    defineField({
      name: 'openingHoursNote',
      title: 'Åpningstider (tillegg)',
      type: 'string',
      initialValue: 'og etter avtale',
      description: 'Vises etter kortteksten — f.eks. «og etter avtale»',
    }),
    defineField({
      name: 'openingHours',
      title: 'Åpningstider (utvidet)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rik tekst til Besøk oss-siden',
    }),

    // ─── MEDLEMSKAP ─────────────────────────────────────────────
    defineField({
      name: 'membershipUrl',
      title: 'Bli medlem — URL',
      type: 'url',
      initialValue: 'https://blimedlem.tryllemuseet.no',
      description: 'Brukes i header-knapp, footer og alle «Bli medlem»-lenker',
    }),
    defineField({
      name: 'vippsNumber',
      title: 'Vipps-nummer',
      type: 'string',
      initialValue: '95626',
    }),

    // ─── SOSIALE MEDIER ─────────────────────────────────────────
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'url',
      initialValue: 'https://www.facebook.com/tryllemuseet',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      initialValue: 'https://www.instagram.com/tryllemuseet',
    }),
    defineField({
      name: 'youtube',
      title: 'YouTube',
      type: 'url',
    }),

    // ─── SEO ────────────────────────────────────────────────────
    defineField({
      name: 'seoDescription',
      title: 'Standard meta-beskrivelse',
      type: 'text',
      rows: 2,
      initialValue: 'Norges minste, merkeligste og mest magiske museum. Besøk oss på Årvoll i Oslo — søndager 12–16. Gratis inngang.',
    }),
  ],

  preview: {
    select: { title: 'siteName' },
  },
})
