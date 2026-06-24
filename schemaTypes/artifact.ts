// sanity-web/schemaTypes/artifact.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'artifact',
  title: 'Artefakt',
  type: 'document',
  icon: () => '🎩',

  fields: [
    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    // ── Grunnleggende ─────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Navn / tittel',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 4,
      description: 'Kort beskrivelse som vises i oversikten og på detaljsiden.',
    }),

    // ── Eierskap og anskaffelse ───────────────────────────────────
    defineField({
      name: 'ownerName',
      title: 'Eier',
      type: 'string',
      description: 'F.eks. "Tryllemuseet", "Per Olsen", "Oslo Museum".',
    }),
    defineField({
      name: 'acquisitionType',
      title: 'Anskaffelsesmåte',
      type: 'string',
      options: {
        list: [
          { title: 'Kjøpt',                          value: 'purchase' },
          { title: 'Gave / donasjon',                value: 'gift'     },
          { title: 'Depot (permanent depositum)',    value: 'deposit'  },
          { title: 'Innlån (midlertidig)',           value: 'loan_in'  },
          { title: 'Ukjent',                         value: 'unknown'  },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'acquisitionDate',
      title: 'Anskaffelsesdato',
      type: 'date',
      description: 'Dato museet mottok eller kjøpte gjenstanden.',
    }),
    defineField({
      name: 'acquisitionNote',
      title: 'Anskaffelsesmerknad',
      type: 'string',
      description: 'F.eks. "Gave fra familie Andersen, 2018" eller "Kjøpt på auksjon".',
    }),

    // ── Innlån (vises kun ved anskaffelsesmåte = innlån) ─────────
    defineField({
      name: 'lenderName',
      title: 'Utlåner (navn)',
      type: 'string',
      description: 'Fullt navn på person eller institusjon som låner ut gjenstanden.',
      hidden: ({ parent }: { parent: { acquisitionType?: string } }) => parent?.acquisitionType !== 'loan_in',
    }),
    defineField({
      name: 'lenderContact',
      title: 'Utlåner (kontakt)',
      type: 'string',
      description: 'E-post eller telefon til utlåner.',
      hidden: ({ parent }: { parent: { acquisitionType?: string } }) => parent?.acquisitionType !== 'loan_in',
    }),
    defineField({
      name: 'loanFrom',
      title: 'Innlånsperiode — fra',
      type: 'date',
      hidden: ({ parent }: { parent: { acquisitionType?: string } }) => parent?.acquisitionType !== 'loan_in',
    }),
    defineField({
      name: 'loanTo',
      title: 'Innlånsperiode — til',
      type: 'date',
      hidden: ({ parent }: { parent: { acquisitionType?: string } }) => parent?.acquisitionType !== 'loan_in',
    }),
    defineField({
      name: 'loanReference',
      title: 'Innlånsavtale / referansenummer',
      type: 'string',
      description: 'Avtalenummer eller arkivreferanse for innlånsavtalen.',
      hidden: ({ parent }: { parent: { acquisitionType?: string } }) => parent?.acquisitionType !== 'loan_in',
    }),

    // ── Utlån (museet låner ut til andre) ────────────────────────
    defineField({
      name: 'onLoanOut',
      title: 'Utlånt til annen institusjon',
      type: 'boolean',
      initialValue: false,
      description: 'Slå på hvis gjenstanden er midlertidig utlånt til en annen institusjon.',
    }),
    defineField({
      name: 'loanOutTo',
      title: 'Utlånt til (navn)',
      type: 'string',
      description: 'Navn på institusjon eller person som har gjenstanden.',
      hidden: ({ parent }: { parent: { onLoanOut?: boolean } }) => !parent?.onLoanOut,
    }),
    defineField({
      name: 'loanOutFrom',
      title: 'Utlånsperiode — fra',
      type: 'date',
      hidden: ({ parent }: { parent: { onLoanOut?: boolean } }) => !parent?.onLoanOut,
    }),
    defineField({
      name: 'loanOutUntil',
      title: 'Utlånsperiode — til',
      type: 'date',
      hidden: ({ parent }: { parent: { onLoanOut?: boolean } }) => !parent?.onLoanOut,
    }),
    defineField({
      name: 'loanOutReference',
      title: 'Utlånsavtale / referansenummer',
      type: 'string',
      description: 'Avtalenummer eller arkivreferanse for utlånsavtalen.',
      hidden: ({ parent }: { parent: { onLoanOut?: boolean } }) => !parent?.onLoanOut,
    }),

    // ── Museumsinformasjon ────────────────────────────────────────
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Rekvisitt',         value: 'rekvisitt' },
          { title: 'Plakat / trykk',    value: 'plakat' },
          { title: 'Bøker / trykksak',  value: 'bok' },
          { title: 'Kostyme',           value: 'kostyme' },
          { title: 'Instrument',        value: 'instrument' },
          { title: 'Foto / portrett',   value: 'foto' },
          { title: 'Personlig effekt',  value: 'effekt' },
          { title: 'Annet',             value: 'annet' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'year',
      title: 'År (tall)',
      type: 'number',
      description: 'Årstall for produksjon/bruk. Brukes til sortering.',
    }),
    defineField({
      name: 'yearNote',
      title: 'Årstall-merknad',
      type: 'string',
      description: 'F.eks. "ca. 1890", "1880-tallet", "ukjent".',
    }),
    defineField({
      name: 'origin',
      title: 'Opprinnelse / land',
      type: 'string',
      description: 'F.eks. "Frankrike", "USA", "Ukjent".',
    }),
    defineField({
      name: 'material',
      title: 'Materiale',
      type: 'string',
      description: 'F.eks. "Tre, silke, metall".',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensjoner',
      type: 'string',
      description: 'F.eks. "30 × 20 × 15 cm".',
    }),
    defineField({
      name: 'condition',
      title: 'Tilstand',
      type: 'string',
      options: {
        list: [
          { title: 'Utmerket',  value: 'excellent' },
          { title: 'God',       value: 'good' },
          { title: 'Middels',   value: 'fair' },
          { title: 'Dårlig',    value: 'poor' },
          { title: 'Restaurert', value: 'restored' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'provenance',
      title: 'Proveniens / historikk',
      type: 'text',
      rows: 3,
      description: 'Hvem eide gjenstanden, hvor kom den fra, eventuelle dokumenter.',
    }),
    defineField({
      name: 'displayLocation',
      title: 'Plassering i museet',
      type: 'string',
      description: 'F.eks. "Sal 2, monter A", "Inngangspartiet", "Magasin".',
    }),

    // ── Bilder ────────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'Beskriv bildet for skjermlesere.',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Bildegalleri',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt',     title: 'Alt-tekst',  type: 'string' },
            { name: 'caption', title: 'Bildetekst', type: 'string' },
          ],
        },
      ],
    }),

    // ── Redaksjonelt ──────────────────────────────────────────────
    defineField({
      name: 'notes',
      title: 'Utfyllende tekst',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Lengre redaksjonell tekst om gjenstanden.',
    }),
    defineField({
      name: 'tags',
      title: 'Tagger',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── Visning ───────────────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Fremhevet',
      type: 'boolean',
      initialValue: false,
      description: 'Vis på portalsiden og forsiden.',
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsrekkefølge',
      type: 'number',
      description: 'Lavere tall vises først. Blankt = alfabetisk.',
    }),
  ],

  // ── Forhåndsvisning i Studio ───────────────────────────────────
  preview: {
    select: {
      title:    'title',
      subtitle: 'category',
      media:    'mainImage',
    },
    prepare({ title, subtitle, media }) {
      const categories: Record<string, string> = {
        rekvisitt: 'Rekvisitt', plakat: 'Plakat / trykk',
        bok: 'Bøker / trykksak', kostyme: 'Kostyme',
        instrument: 'Instrument', foto: 'Foto / portrett',
        effekt: 'Personlig effekt', annet: 'Annet',
      }
      return {
        title,
        subtitle: subtitle ? categories[subtitle] ?? subtitle : 'Artefakt',
        media,
      }
    },
  },

  // ── Sortering i Studio ────────────────────────────────────────
  orderings: [
    {
      title: 'Sorteringsrekkefølge',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'År (eldst først)',
      name: 'yearAsc',
      by: [{ field: 'year', direction: 'asc' }],
    },
    {
      title: 'Tittel A–Å',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
