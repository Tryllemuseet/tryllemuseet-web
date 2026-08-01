// schemaTypes/magicClubEdition.ts
import { defineType, defineField } from 'sanity'

// Én kveld i «Magic Club» — Davidos faste magikerkveld i Oslo (2015–).
// Samleartikkelen om selve konseptet er et vanlig `legend`-dokument
// (se seriesRef under); denne typen er kun de enkelte kveldene.
export const magicClubEdition = defineType({
  name: 'magicClubEdition',
  title: 'Magic Club — kveld',
  type: 'document',
  icon: () => '🎩',
  fields: [

    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul kvelden fra nettsiden uten å slette den. Standard: på.',
    }),

    defineField({
      name: 'date',
      title: 'Dato',
      type: 'date',
      validation: R => R.required(),
    }),

    defineField({
      name: 'venue',
      title: 'Spillested',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      description: 'Skriv inn manuelt, f.eks. «2019-10-17» — sett ikke to kvelder til samme slug.',
      validation: R => R.required(),
    }),

    defineField({
      name: 'seriesRef',
      title: 'Konsept-artikkel',
      type: 'reference',
      to: [{ type: 'legend' }],
      description: 'Kobling tilbake til samleartikkelen om Magic Club-konseptet under Fordypninger.',
    }),

    defineField({
      name: 'poster',
      title: 'Plakat',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),

    defineField({
      name: 'guestStars',
      title: 'Gjestestjerner',
      description: 'Internasjonale eller spesielle gjester denne kvelden.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'guestStar',
        fields: [
          defineField({ name: 'name', title: 'Navn', type: 'string', validation: R => R.required() }),
          defineField({
            name: 'description',
            title: 'Beskrivelse',
            type: 'string',
            description: 'F.eks. «Livin\' Legend» eller «Top Class Juggler (NL)»',
          }),
        ],
        preview: { select: { title: 'name', subtitle: 'description' } },
      }],
    }),

    defineField({
      name: 'lineup',
      title: 'Norsk lineup',
      description: 'Norske tryllekunstnere denne kvelden. Kobles til «Hvem er hvem» der biografi finnes.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'lineupEntry',
        fields: [
          defineField({ name: 'name', title: 'Navn', type: 'string', validation: R => R.required() }),
          defineField({
            name: 'bioRef',
            title: 'Biografi (fra register)',
            type: 'reference',
            to: [{ type: 'biography' }],
            description: 'Finnes personen i HEH-registeret fra før, koble til her.',
          }),
        ],
        preview: {
          select: { name: 'name', refName: 'bioRef.name' },
          prepare({ name, refName }: { name?: string; refName?: string }) {
            return { title: name ?? '(uten navn)', subtitle: refName ? `→ ${refName}` : undefined }
          },
        },
      }],
    }),

    defineField({
      name: 'otherActs',
      title: 'Øvrige innslag',
      description: 'F.eks. dansere eller musikalske innslag.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'otherAct',
        fields: [
          defineField({ name: 'category', title: 'Kategori', type: 'string', description: 'F.eks. «Dansere» eller «Musikk»' }),
          defineField({ name: 'names', title: 'Navn', type: 'string' }),
        ],
        preview: {
          select: { category: 'category', names: 'names' },
          prepare({ category, names }: { category?: string; names?: string }) {
            return { title: category ?? '(uten kategori)', subtitle: names }
          },
        },
      }],
    }),

    defineField({
      name: 'notes',
      title: 'Notater',
      type: 'text',
      rows: 4,
      description: 'Hva gjorde akkurat denne kvelden spesiell, hvis kjent.',
    }),

    defineField({
      name: 'sourceUrl',
      title: 'Kilde-URL',
      type: 'url',
      description: 'F.eks. lenke til Facebook-posten denne informasjonen er hentet fra.',
    }),

  ],

  orderings: [
    {
      title: 'Dato (nyest først)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],

  preview: {
    select: { date: 'date', venue: 'venue', media: 'poster' },
    prepare({ date, venue, media }: { date?: string; venue?: string; media?: unknown }) {
      const dateStr = date ? new Date(date).toLocaleDateString('nb-NO') : '(uten dato)'
      return { title: dateStr, subtitle: venue, media }
    },
  },
})
