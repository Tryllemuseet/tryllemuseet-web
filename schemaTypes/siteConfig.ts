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
    defineField({
      name: 'mapEmbedUrl',
      title: 'Google Maps embed-URL',
      type: 'url',
      description: 'Kartet som vises på Besøk oss-siden. Hentes fra Google Maps → Del → «Bygg inn kart» → kopier URL-en fra src="…" i iframe-koden. La stå tom for å bruke standardkartet.',
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

    // ─── DONASJON ───────────────────────────────────────────────
    // Egen støtteform ved siden av medlemskap — se
    // docs/tryllemuseet_lanseringsforbedringer_ai.md seksjon 6–7.
    // «Bli medlem» og «Gi en gave» skal aldri pekes til samme lenke.
    defineField({
      name: 'donationUrl',
      title: 'Gi en gave — URL',
      type: 'url',
      description: 'Lenke til museets betalings-/donasjonsløsning (f.eks. en dedikert Vipps-lenke). La stå tom for å vise Vipps-nummeret over i stedet.',
    }),
    defineField({
      name: 'donationLabel',
      title: 'Gi en gave — knappetekst',
      type: 'string',
      initialValue: 'Gi en gave →',
    }),
    defineField({
      name: 'donationText',
      title: 'Gi en gave — tekst',
      type: 'text',
      rows: 3,
      initialValue: 'Museet drives i stor grad av frivillige. En gave bidrar til å bevare samlingen, utvikle utstillingene og holde museet gratis og tilgjengelig for alle.',
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
