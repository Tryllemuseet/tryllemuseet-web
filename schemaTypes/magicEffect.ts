// schemaTypes/magicEffect.ts
//
// "Trylleeffekt": the museum's public record of a magic effect or trick —
// what the audience sees, who created and produced it, when and where, and
// which objects, books and sources belong to it. Norwegian-produced effects
// are the first focus (the `countries` field drives that filter). See
// docs/trylleeffekter-concept.md.
//
// Public content in the production dataset. It NEVER describes the method:
// methods live in the closed area (kitTrick/kitOriginal in the private
// "lukket" dataset), which can't be referenced from here anyway.
//
// Rendered at /tryllehistorie/trylleeffekter (hidden behind
// siteConfig.trylleeffekterActive until launch).
import { defineType, defineField, defineArrayMember } from 'sanity'
import { richBlockContent } from './richBlockContent'

export const MAGIC_EFFECT_COUNTRIES = [
  { title: 'Norge', value: 'no' },
  { title: 'Sverige', value: 'se' },
  { title: 'Danmark', value: 'dk' },
  { title: 'Finland', value: 'fi' },
  { title: 'Storbritannia', value: 'gb' },
  { title: 'USA', value: 'us' },
  { title: 'Tyskland', value: 'de' },
  { title: 'Frankrike', value: 'fr' },
  { title: 'Italia', value: 'it' },
  { title: 'Spania', value: 'es' },
  { title: 'Japan', value: 'jp' },
  { title: 'Kina', value: 'cn' },
  { title: 'Annet / ukjent', value: 'other' },
]

export const MAGIC_EFFECT_CATEGORIES = [
  { title: 'Kort', value: 'kort' },
  { title: 'Mynter', value: 'mynter' },
  { title: 'Tau', value: 'tau' },
  { title: 'Ringer', value: 'ringer' },
  { title: 'Baller og kuler', value: 'baller' },
  { title: 'Papir og sedler', value: 'papir' },
  { title: 'Mentalisme', value: 'mentalisme' },
  { title: 'Forsvinning og forvandling', value: 'forsvinning' },
  { title: 'Illusjon (scene)', value: 'illusjon' },
  { title: 'Barnetriks', value: 'barnetriks' },
  { title: 'Annet', value: 'annet' },
]

export const magicEffect = defineType({
  name: 'magicEffect',
  title: 'Trylleeffekt',
  type: 'document',
  icon: () => '✨',
  description: 'En trylleeffekt eller et triks i museets oversikt: hva publikum ser, hvem som laget den, når og hvor. Aldri hvordan den gjøres.',

  groups: [
    { name: 'main', title: 'Effekten', default: true },
    { name: 'origin', title: 'Opphav' },
    { name: 'links', title: 'Bilder og koblinger' },
  ],

  fields: [
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
      group: 'main',
    }),

    // ── EFFEKTEN ─────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Navn',
      type: 'string',
      group: 'main',
      description: 'Det norske navnet effekten er kjent under, f.eks. «Begerspillet».',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      group: 'main',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'alternativeNames',
      title: 'Andre navn',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Originalnavn eller andre navn, f.eks. «Cups and Balls».',
    }),
    defineField({
      name: 'summary',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 2,
      group: 'main',
      description: 'Én–to setninger til kort og søkemotorer.',
      validation: R => R.max(240),
    }),
    defineField({
      name: 'effect',
      title: 'Effekten — hva publikum ser',
      type: 'array',
      group: 'main',
      of: richBlockContent(),
      description: 'Beskriv bare det publikum opplever. Ikke skriv hvordan trikset gjøres: denne siden er åpen for alle. Metoden hører hjemme i Bak teppet.',
    }),
    defineField({
      name: 'history',
      title: 'Historikk',
      type: 'array',
      group: 'main',
      of: richBlockContent(),
      description: 'Opphav, varianter, kjente utøvere og hvordan effekten spredte seg.',
    }),
    defineField({
      name: 'categories',
      title: 'Kategorier',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: { list: MAGIC_EFFECT_CATEGORIES, layout: 'grid' },
    }),

    // ── OPPHAV ───────────────────────────────────────────────────
    defineField({
      name: 'creators',
      title: 'Skaper / oppfinner',
      type: 'array',
      group: 'origin',
      of: [{ type: 'reference', to: [{ type: 'biography' }] }],
      description: 'Personer i Hvem er hvem.',
      validation: R => R.unique(),
    }),
    defineField({
      name: 'creatorNote',
      title: 'Skaper (fritekst)',
      type: 'string',
      group: 'origin',
      description: 'Når skaperen ikke er i Hvem er hvem eller er usikker, f.eks. «Tradisjonell» eller «Ukjent, trolig tysk».',
    }),
    defineField({
      name: 'producers',
      title: 'Produsent / forhandler',
      type: 'array',
      group: 'origin',
      description: 'Hvem som laget eller solgte effekten, f.eks. en norsk tryllebutikk.',
      of: [
        defineArrayMember({
          name: 'magicEffectProducer',
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Navn', type: 'string', validation: R => R.required() }),
            defineField({ name: 'biography', title: 'Person i Hvem er hvem', type: 'reference', to: [{ type: 'biography' }] }),
            defineField({ name: 'years', title: 'Periode', type: 'string', description: 'F.eks. «1950–1970».' }),
          ],
          preview: { select: { title: 'name', subtitle: 'years' } },
        }),
      ],
    }),
    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      group: 'origin',
      description: 'Første kjente år. Brukes til sortering.',
      validation: R => R.integer().min(1000).max(2100),
    }),
    defineField({
      name: 'yearNote',
      title: 'Tidfesting (fritekst)',
      type: 'string',
      group: 'origin',
      description: 'Vises i stedet for året, f.eks. «ca. 1950-tallet» eller «kjent siden antikken».',
    }),
    defineField({
      name: 'countries',
      title: 'Land',
      type: 'array',
      group: 'origin',
      of: [{ type: 'string' }],
      options: { list: MAGIC_EFFECT_COUNTRIES, layout: 'grid' },
      description: 'Hvor effekten ble laget eller produsert. «Norge» gjør at den vises under «Norskprodusert».',
    }),

    // ── BILDER OG KOBLINGER ──────────────────────────────────────
    defineField({
      name: 'images',
      title: 'Bilder',
      type: 'array',
      group: 'links',
      description: 'Rekvisitter, reklame, emballasje. Aldri bilder som avslører hvordan trikset gjøres.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt-tekst', type: 'string', validation: R => R.required().warning('Bilder bør ha alt-tekst.') }),
            defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'artifacts',
      title: 'Gjenstander i samlingen',
      type: 'array',
      group: 'links',
      of: [{ type: 'reference', to: [{ type: 'artifact' }] }],
      validation: R => R.unique(),
    }),
    defineField({
      name: 'books',
      title: 'Litteratur i biblioteket',
      type: 'array',
      group: 'links',
      of: [{ type: 'reference', to: [{ type: 'book' }] }],
      validation: R => R.unique(),
    }),
    defineField({
      name: 'sources',
      title: 'Kilder',
      type: 'array',
      group: 'links',
      of: [{ type: 'sourceItem' }],
    }),
    defineField({
      name: 'internalNote',
      title: 'Internt notat',
      type: 'text',
      rows: 3,
      group: 'links',
      description: 'Vises aldri på nettsiden, f.eks. «Metoden er beskrevet i Bak teppet som Begerspillet».',
    }),
  ],

  orderings: [
    { title: 'Navn A–Å', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
    { title: 'År', name: 'yearAsc', by: [{ field: 'year', direction: 'asc' }] },
  ],

  preview: {
    select: { title: 'title', year: 'year', yearNote: 'yearNote', countries: 'countries', visible: 'isVisible', media: 'images.0' },
    prepare({ title, year, yearNote, countries, visible, media }: { title?: string; year?: number; yearNote?: string; countries?: string[]; visible?: boolean; media?: unknown }) {
      const country = countries?.includes('no') ? 'Norsk' : undefined
      return {
        title: (visible === false ? '⚪ ' : '') + (title ?? '(uten navn)'),
        subtitle: [yearNote ?? year, country].filter(Boolean).join(' · '),
        media: media as never,
      }
    },
  },
})
