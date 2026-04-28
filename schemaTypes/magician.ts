import { defineType, defineField } from 'sanity'

export const magician = defineType({
  name: 'magician',
  title: 'Magiker / Utstillingsfelt',
  type: 'document',
  icon: () => '🎩',
  fields: [

    // ── 1. BARNETEKST — øverst, som på nettsiden ──────────────────
    defineField({
      name: 'childText',
      title: '⭐ Barnetekst — veggpanel (under 120 cm)',
      type: 'text',
      rows: 4,
      description: 'Enkel tekst for barn. Vises øverst på nettsiden og i museet. Maks 300 tegn.',
      validation: R => R.max(300),
    }),
    defineField({
      name: 'childActivity',
      title: '⭐ Aktivitet — gul boks',
      type: 'string',
      description: 'Oppfordring til barnet: "Pek tryllestaven på noe magisk!"',
      validation: R => R.max(120),
    }),

    // ── 2. VOKSENTEKST — veggpanel ────────────────────────────────
    defineField({
      name: 'adultText',
      title: 'Voksentekst — veggpanel (130–160 cm)',
      type: 'array',
      description: 'Trykkeklar tekst for de voksne. 2–3 avsnitt.',
      of: [{ type: 'block' }],
    }),

    // ── 3. DETALJERT TEKST — mobilside / QR-destinasjon ──────────
    defineField({
      name: 'mobileIntro',
      title: 'Detaljert tekst — ingress',
      type: 'text',
      rows: 3,
      description: 'Første avsnitt i den detaljerte teksten. QR-koden i museet går til denne seksjonen.',
    }),
    defineField({
      name: 'mobileSections',
      title: 'Detaljert tekst — seksjoner',
      type: 'array',
      description: 'Utdypende tekst delt i seksjoner med overskrift og brødtekst.',
      of: [{ type: 'contentSection' }],
    }),

    // ── 4. KILDER ─────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Kilder — eksterne lenker',
      type: 'array',
      description: 'Lenker åpnes i ny fane. Wikipedia, IMDb, fagbøker osv.',
      of: [{ type: 'sourceItem' }],
    }),

    // ── METADATA — kun internt ────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Navn (internt)',
      type: 'string',
      description: 'F.eks. "Harry Houdini" eller "Plasma-kulen"',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug (internt)',
      type: 'slug',
      description: 'Genereres automatisk. Brukes i URL: /utstillingen/houdini',
      options: { source: 'title', maxLength: 60 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Slagord (internt)',
      type: 'string',
      description: 'Kort undertittel som vises på oversiktssiden.',
      validation: R => R.max(60),
    }),
    defineField({
      name: 'years',
      title: 'Årstall (internt)',
      type: 'string',
      description: 'F.eks. "1874–1926" eller "2006"',
    }),
    defineField({
      name: 'posterImage',
      title: 'Plakatbilde (internt)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst (tilgjengelighet)',
          type: 'string',
          description: 'F.eks. "Reklameplakat for Houdini ca. 1906"',
          validation: R => R.required(),
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsrekkefølge (internt — vises ikke)',
      type: 'number',
      description: '1=Plasma, 2=Filmene, 3=Robert-Houdin … 7=Houdini',
      validation: R => R.required().min(1).max(7),
    }),
    defineField({
      name: 'qrNumber',
      title: 'QR-kodenummer (internt)',
      type: 'number',
      description: 'Brukes kun i museet. QR-koden peker til #detaljer på denne siden.',
      validation: R => R.min(1).max(7),
    }),

  ],

  // Forhåndsvisning i Studio-listen — viser navn og slagord
  preview: {
    select: {
      title:    'title',
      subtitle: 'tagline',
      media:    'posterImage',
      order:    'order',
    },
    prepare({ title, subtitle, media, order }) {
      return {
        title:    `${order ?? '?'}. ${title ?? '(uten navn)'}`,
        subtitle: subtitle ?? '',
        media:    media,
      }
    },
  },
})
