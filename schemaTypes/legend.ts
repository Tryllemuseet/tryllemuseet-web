// schemaTypes/legend.ts
import { defineType, defineField } from 'sanity'

export const legend = defineType({
  name: 'legend',
  title: 'Fordypning',
  type: 'document',
  icon: () => '🌟',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    // ── 1. IDENTITET ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Navn / tittel',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name: 'biographyRef',
      title: 'Kobling til biografi',
      type: 'reference',
      to: [{ type: 'biography' }],
      description: 'Koble til en eksisterende biografi i HEH-registeret. Valgfri — enkelte artikler handler ikke om én person (f.eks. et objekt eller et samletema).',
    }),

    defineField({
      name: 'tagline',
      title: 'Slagord / undertittel',
      type: 'string',
      description: 'Kort undertittel til kortvisning. F.eks. «Verdens største utbryterkonge». Uavhengig av biografi-kobling.',
      validation: R => R.max(60),
    }),

    defineField({
      name: 'years',
      title: 'Årstall',
      type: 'string',
      description: 'F.eks. «1874–1926» eller «2006». Uavhengig av biografi-kobling.',
    }),

    // ── 2. PLASSERING — kun ved fysisk tilstedeværelse i museet ────
    defineField({
      name: 'qrNumber',
      title: 'QR-kodenummer (internt)',
      type: 'number',
      description: 'Fylles kun ut hvis artikkelen har en fysisk QR-kode i museet.',
      validation: R => R.min(1),
    }),

    defineField({
      name: 'physicalOrder',
      title: 'Rekkefølge på vegg (internt)',
      type: 'number',
      description: 'Fylles kun ut hvis artikkelen har en fast fysisk plassering, f.eks. i Gullalderen.',
    }),

    // ── 3. DYBDE 0 — KORT FORM (veggpanel) ──────────────────────────
    defineField({
      name: 'childText',
      title: '⭐ Barnetekst — veggpanel (under 120 cm)',
      type: 'text',
      rows: 4,
      description: 'Enkel tekst for barn. Vises øverst på nettsiden og i museet, der artikkelen har fysisk plassering. Maks 300 tegn.',
      validation: R => R.max(300),
    }),
    defineField({
      name: 'childActivity',
      title: '⭐ Aktivitet — gul boks',
      type: 'string',
      description: 'Oppfordring til barnet: "Pek tryllestaven på noe magisk!"',
      validation: R => R.max(120),
    }),
    defineField({
      name: 'wallText',
      title: 'Voksentekst — veggpanel (kort)',
      type: 'array',
      description: 'Kort, trykkeklar tekst for de voksne. 2–3 avsnitt. Brukes øverst på siden — ikke forveksle med den lengre brødteksten under.',
      of: [{ type: 'block' }],
    }),

    // ── 4. DYBDE 1 — UTDYPENDE INNHOLD ──────────────────────────────
    defineField({
      name: 'excerpt',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      description: 'Kort tekst som vises på oversiktssiden.',
    }),

    defineField({
      name: 'detailIntro',
      title: 'Utdypende tekst — ingress',
      type: 'text',
      rows: 3,
      description: 'Første avsnitt i den detaljerte teksten, over eventuelle seksjoner under.',
    }),

    defineField({
      name: 'sections',
      title: 'Utdypende tekst — seksjoner',
      type: 'array',
      description: 'Valgfritt: del opp utdypende tekst i seksjoner med egen overskrift.',
      of: [{ type: 'contentSection' }],
    }),

    defineField({
      name: 'content',
      title: 'Brødtekst',
      type: 'array',
      description: 'Generell løpende brødtekst. Brukes typisk når artikkelen ikke er delt i seksjoner over.',
      of: [{ type: 'block' }],
    }),

    defineField({
      name: 'tags',
      title: 'Tagger',
      type: 'array',
      description: 'Fri temamerking, brukt til gruppering og filtrering (f.eks. «gullalderen», «kvinner-i-norsk-trylling», «jubileum»).',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── 5. MEDIA ──────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt',     title: 'Alt-tekst',  type: 'string' }),
        defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
      ],
    }),

    defineField({
      name: 'gallery',
      title: 'Bildegalleri',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({ name: 'alt',     title: 'Alt-tekst',  type: 'string' }),
          defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
        ],
      }],
    }),

    defineField({
      name: 'videos',
      title: 'Videoer',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Tittel', type: 'string', validation: R => R.required() }),
          defineField({ name: 'url',   title: 'URL',    type: 'url',    validation: R => R.required() }),
          defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
              list: [
                { title: 'TV-opptreden',  value: 'tv'        },
                { title: 'Intervju',      value: 'intervju'  },
                { title: 'Opptreden',     value: 'opptreden' },
                { title: 'Annet',         value: 'annet'     },
              ],
            },
          }),
          defineField({ name: 'year', title: 'År', type: 'number' }),
        ],
        preview: {
          select: { title: 'title', year: 'year' },
          prepare({ title, year }: { title?: string; year?: number }) {
            return { title: title ?? '(uten tittel)', subtitle: year ? String(year) : '' }
          },
        },
      }],
    }),

    // ── 6. DYBDE 2 — STASJONER (valgfritt) ──────────────────────────
    defineField({
      name: 'stations',
      title: 'Stasjoner / dybder',
      type: 'array',
      description: 'Valgfritt: en ordnet fortelling i flere deler (f.eks. en tidslinje). Bruk kun der artikkelen faktisk trenger flere trinn — de fleste artikler klarer seg med feltene over.',
      of: [{
        type: 'object',
        title: 'Stasjon',
        fields: [
          defineField({ name: 'title', title: 'Tittel', type: 'string', validation: R => R.required() }),
          defineField({ name: 'order', title: 'Rekkefølge', type: 'number' }),
          defineField({ name: 'year',  title: 'Årstall', type: 'string', description: 'F.eks. "1908" eller "1874–1887"' }),
          defineField({
            name: 'image',
            title: 'Bilde',
            type: 'image',
            options: { hotspot: true },
            fields: [
              defineField({ name: 'alt', title: 'Alt-tekst (tilgjengelighet)', type: 'string', validation: R => R.required() }),
            ],
          }),
          defineField({ name: 'textKids',   title: '⭐ Tekst (barn)',   type: 'text', rows: 3 }),
          defineField({ name: 'textAdults', title: 'Tekst (voksne)',    type: 'text', rows: 5 }),
          defineField({ name: 'activityPrompt', title: 'Aktivitet / «prøv selv»', type: 'string', description: 'Valgfritt – kort interaktiv oppfordring' }),
        ],
        preview: {
          select: { title: 'title', year: 'year', order: 'order', media: 'image' },
          prepare({ title, year, order, media }: { title?: string; year?: string; order?: number; media?: unknown }) {
            return {
              title:    `${order ?? '?'}. ${title ?? '(uten navn)'}`,
              subtitle: year ?? '',
              media,
            }
          },
        },
      }],
    }),

    // ── 7. KILDER ─────────────────────────────────────────────────
    defineField({
      name: 'sources',
      title: 'Kilder',
      type: 'array',
      of: [{ type: 'sourceItem' }],
    }),

  ],

  orderings: [
    {
      title: 'Navn (A–Å)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title:    'title',
      subtitle: 'tagline',
      media:    'mainImage',
    },
    prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: unknown }) {
      return {
        title:    title ?? '(uten tittel)',
        subtitle: subtitle ?? '',
        media,
      }
    },
  },
})
