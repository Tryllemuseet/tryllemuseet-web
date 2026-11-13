// schemaTypes/farmSeason.ts
//
// A season pack for "Tryllegården" (/barn/tryllegarden): title, colours, the
// thing being collected, and the places with their mini-games and texts.
// Concept: docs/tryllegarden-concept.md.
//
// Every field is optional. A document whose key matches a season built into
// the code (web/src/lib/tryllegardenSeason.ts — "jul") only overrides the
// fields that are filled in; a document with a new key is a whole new season.
// Public dataset: never write a trick's method here. A place points at its
// tryllebeskrivelse (private dataset) by slug.
import { defineType, defineField, defineArrayMember } from 'sanity'

const LEVELS = [
  { title: 'Smånisse (alle nivåer)', value: 'smanisse' },
  { title: 'Tryllelærling og Tryllemester', value: 'laerling' },
  { title: 'Bare Tryllemester', value: 'mester' },
]

const percent = (name: string, title: string) =>
  defineField({ name, title, type: 'number', validation: R => R.min(0).max(100) })

const line = defineArrayMember({
  type: 'object',
  name: 'farmLine',
  title: 'Replikk',
  fields: [
    defineField({
      name: 'who',
      title: 'Hvem snakker',
      type: 'string',
      options: {
        list: [
          { title: 'Tryllejenta', value: 'jente' },
          { title: 'Tryllegutten', value: 'gutt' },
          { title: 'Lapp fra nissen', value: 'nisse' },
          { title: 'Forteller', value: 'forteller' },
        ],
        layout: 'radio',
      },
      initialValue: 'jente',
      validation: R => R.required(),
    }),
    defineField({ name: 'text', title: 'Tekst', type: 'text', rows: 2, validation: R => R.required() }),
    defineField({ name: 'textEn', title: 'Tekst (engelsk)', type: 'text', rows: 2 }),
  ],
  preview: { select: { title: 'text', subtitle: 'who' } },
})

const levelParams = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'rounds',
        title: 'Runder',
        type: 'array',
        of: [defineArrayMember({ type: 'number' })],
        description: 'Ett tall per runde. Tallet betyr: fugler som skal huskes, fletter, kaker i raden, ruter per side, ting på hylla eller antall lykter – alt etter minispillet.',
      }),
      defineField({ name: 'reverse', title: 'Siste runde skal svares baklengs («Husk rekkefølgen»)', type: 'boolean' }),
    ],
  })

const item = defineArrayMember({
  type: 'object',
  name: 'farmItem',
  title: 'Ting',
  fields: [
    defineField({
      name: 'key',
      title: 'Nøkkel',
      type: 'string',
      validation: R => R.required().regex(/^[a-z0-9-]+$/).error('Bare små bokstaver, tall og bindestrek.'),
    }),
    defineField({ name: 'label', title: 'Navn / tekst', type: 'string', validation: R => R.required() }),
    defineField({ name: 'labelEn', title: 'Navn / tekst (engelsk)', type: 'string' }),
    defineField({ name: 'image', title: 'Bilde', type: 'image', description: 'Gjennomsiktig bakgrunn. Uten bilde brukes emojien.' }),
    defineField({ name: 'emoji', title: 'Emoji (reserve)', type: 'string' }),
    percent('x', 'Plassering fra venstre (%)'),
    percent('y', 'Plassering fra toppen (%)'),
    defineField({ name: 'from', title: 'Vises på', type: 'string', options: { list: LEVELS }, initialValue: 'smanisse' }),
    defineField({ name: 'order', title: 'Nummer i rekkefølgen', type: 'number', description: 'Bare for «Riktig rekkefølge».' }),
    defineField({ name: 'decoy', title: 'Hører ikke hjemme her (lurekort)', type: 'boolean', description: 'Bare for «Riktig rekkefølge».' }),
    defineField({ name: 'wrong', title: 'Det barna sier når lurekortet velges', type: 'string' }),
    defineField({ name: 'wrongEn', title: 'Det barna sier når lurekortet velges (engelsk)', type: 'string' }),
    defineField({
      name: 'colors',
      title: 'Farger på reservefuglen',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Bare for «Husk rekkefølgen», når fuglen ikke har bilde: kropp, bryst og hette som fargekoder (#rrggbb).',
      validation: R => R.max(3),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'key', media: 'image' } },
})

const place = defineArrayMember({
  type: 'object',
  name: 'farmPlace',
  title: 'Sted',
  groups: [
    { name: 'main', title: 'Stedet', default: true },
    { name: 'game', title: 'Minispill' },
    { name: 'texts', title: 'Tekster' },
    { name: 'trick', title: 'Nissens triks' },
  ],
  fields: [
    defineField({
      name: 'isVisible',
      title: 'Synlig',
      type: 'boolean',
      initialValue: true,
      group: 'main',
      description: 'Av: stedet er ikke med i spillet.',
    }),
    defineField({
      name: 'key',
      title: 'Nøkkel',
      type: 'string',
      group: 'main',
      description: 'Julesesongens innebygde steder heter tunet, fjoset, laven, stallen, bakstehuset, stua, stabburet og lyktestien. Samme nøkkel = feltene du fyller ut her erstatter de innebygde. Ny nøkkel = nytt sted.',
      validation: R => R.required().regex(/^[a-z0-9-]+$/).error('Bare små bokstaver, tall og bindestrek.'),
    }),
    defineField({ name: 'title', title: 'Navn', type: 'string', group: 'main' }),
    defineField({ name: 'titleEn', title: 'Navn (engelsk)', type: 'string', group: 'main' }),
    defineField({
      name: 'sceneImage',
      title: 'Scenebilde',
      type: 'image',
      group: 'main',
      description: 'Bakgrunnen i minispillet, liggende 16:10. Uten bilde brukes en enkel tegnet reserve.',
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
    defineField({ name: 'icon', title: 'Emoji på kartet', type: 'string', group: 'main' }),
    { ...percent('mapX', 'På kartet: fra venstre (%)'), group: 'main' },
    { ...percent('mapY', 'På kartet: fra toppen (%)'), group: 'main' },
    defineField({ name: 'ornament', title: 'Pynt stedet gir (emoji)', type: 'string', group: 'main', description: 'Emoji som henges på treet. Brukes når det ikke finnes bilde.' }),
    defineField({ name: 'ornamentImage', title: 'Pynt stedet gir (bilde)', type: 'image', group: 'main', description: 'Gjennomsiktig bakgrunn, helst kvadratisk. Vises på treet i stedet for emojien.' }),
    { ...percent('nisseX', 'Nissens gjemmested: fra venstre (%)'), group: 'main' },
    { ...percent('nisseY', 'Nissens gjemmested: fra toppen (%)'), group: 'main' },
    defineField({
      name: 'nisseInScene',
      title: 'Nissen er allerede tegnet inn i scenebildet',
      type: 'boolean',
      group: 'main',
      description: 'På: den skjulte nissen blir et usynlig trykkpunkt på stedet der han er tegnet. Av: spillet legger et bilde av nissen som titter fram.',
    }),

    defineField({
      name: 'mechanic',
      title: 'Minispill',
      type: 'string',
      group: 'game',
      options: {
        list: [
          { title: 'Finn tingene i bildet', value: 'finn' },
          { title: 'Riktig rekkefølge', value: 'rekkefolge' },
          { title: 'Husk rekkefølgen', value: 'husk' },
          { title: 'Følg tråden', value: 'folg-traden' },
          { title: 'Fortsett mønsteret', value: 'monster' },
          { title: 'Flett kurven', value: 'flett' },
          { title: 'Hva er forandret?', value: 'forandret' },
          { title: 'Tenn lyktene', value: 'tenn' },
        ],
      },
    }),
    defineField({ name: 'task', title: 'Oppgaven (én setning)', type: 'string', group: 'game' }),
    defineField({ name: 'taskEn', title: 'Oppgaven (engelsk)', type: 'string', group: 'game' }),
    defineField({
      name: 'items',
      title: 'Ting i minispillet',
      type: 'array',
      of: [item],
      group: 'game',
      description: 'Fyller du ut denne, erstatter den hele den innebygde lista for stedet.',
    }),
    defineField({
      name: 'levels',
      title: 'Vanskelighetsgrad (runder per nivå)',
      type: 'object',
      group: 'game',
      fields: [
        levelParams('smanisse', 'Smånisse'),
        levelParams('laerling', 'Tryllelærling'),
        levelParams('mester', 'Tryllemester'),
      ],
    }),
    defineField({
      name: 'hints',
      title: 'Nissen hvisker (to hint)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'game',
      description: 'Først et lite dytt, så et tydeligere hint. Det tredje trinnet viser svaret og trenger ingen tekst.',
      validation: R => R.max(2),
    }),
    defineField({
      name: 'hintsEn',
      title: 'Nissen hvisker (engelsk)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'game',
      validation: R => R.max(2),
    }),

    defineField({ name: 'intro', title: 'Innledning', type: 'array', of: [line], group: 'texts' }),
    defineField({ name: 'done', title: 'Når minispillet er ferdig', type: 'string', group: 'texts' }),
    defineField({ name: 'doneEn', title: 'Når minispillet er ferdig (engelsk)', type: 'string', group: 'texts' }),
    defineField({ name: 'traditionShort', title: 'Visste du at … (kort, for de minste)', type: 'text', rows: 2, group: 'texts' }),
    defineField({ name: 'traditionShortEn', title: 'Visste du at … (kort, engelsk)', type: 'text', rows: 2, group: 'texts' }),
    defineField({ name: 'traditionLong', title: 'Visste du at … (tillegg for de større)', type: 'text', rows: 3, group: 'texts' }),
    defineField({ name: 'traditionLongEn', title: 'Visste du at … (tillegg, engelsk)', type: 'text', rows: 3, group: 'texts' }),
    defineField({ name: 'traditionLinkUrl', title: 'Les mer – lenke', type: 'string', group: 'texts', description: 'For eksempel /besok.' }),
    defineField({ name: 'traditionLinkLabel', title: 'Les mer – lenketekst', type: 'string', group: 'texts' }),

    defineField({ name: 'trickTitle', title: 'Triksets navn', type: 'string', group: 'trick' }),
    defineField({ name: 'trickTitleEn', title: 'Triksets navn (engelsk)', type: 'string', group: 'trick' }),
    defineField({
      name: 'trickEffect',
      title: 'Det publikum ser',
      type: 'text',
      rows: 3,
      group: 'trick',
      description: 'Bare effekten. Skriv ALDRI hvordan trikset gjøres her: dette feltet er åpent for alle. Metoden ligger i tryllebeskrivelsen.',
    }),
    defineField({ name: 'trickEffectEn', title: 'Det publikum ser (engelsk)', type: 'text', rows: 3, group: 'trick' }),
    defineField({
      name: 'trickAge',
      title: 'Passer fra alder',
      type: 'number',
      group: 'trick',
      description: 'Laveste alder trikset passer for. Vises på kortet, og Smånisse får beskjed om å be en voksen hjelpe til når det er 7 eller mer.',
      validation: R => R.min(3).max(16).integer(),
    }),
    defineField({
      name: 'trickSlug',
      title: 'Tryllebeskrivelsens adresse (slug)',
      type: 'string',
      group: 'trick',
      description: 'Slug-en til tryllebeskrivelsen i «Bak teppet (lukket)». Beskrivelsen må ligge i sesongens tryllesett, ellers vises den ikke i spillet.',
    }),
  ],
  preview: {
    select: { title: 'title', key: 'key', visible: 'isVisible', media: 'sceneImage' },
    prepare({ title, key, visible, media }: { title?: string; key?: string; visible?: boolean; media?: any }) {
      return { title: (visible === false ? '⚪ ' : '') + (title || key || 'Sted'), subtitle: key, media }
    },
  },
})

export const farmSeason = defineType({
  name: 'farmSeason',
  title: 'Tryllegården: Sesong',
  type: 'document',
  icon: () => '🎄',
  description:
    'En sesong i barnespillet «Tryllegården». Julesesongen ligger ferdig i koden: et dokument med nøkkel «jul» trenger bare de feltene som skal endres.',
  groups: [
    { name: 'main', title: 'Sesongen', default: true },
    { name: 'places', title: 'Steder' },
    { name: 'finale', title: 'Avslutning' },
  ],
  fields: [
    defineField({
      name: 'isVisible',
      title: 'Synlig',
      type: 'boolean',
      initialValue: true,
      group: 'main',
      description: 'Av: dokumentet brukes ikke. En innebygd sesong (jul) vises da som den er i koden.',
    }),
    defineField({
      name: 'key',
      title: 'Nøkkel',
      type: 'string',
      group: 'main',
      description: 'For eksempel jul, paske, sommer, host. Skrives inn i «Tryllegården: Innstillinger» for å velge sesongen.',
      validation: R => R.required().regex(/^[a-z0-9-]+$/).error('Bare små bokstaver, tall og bindestrek.'),
    }),
    defineField({ name: 'title', title: 'Tittel', type: 'string', group: 'main' }),
    defineField({ name: 'titleEn', title: 'Tittel (engelsk)', type: 'string', group: 'main' }),
    defineField({ name: 'subtitle', title: 'Undertittel', type: 'string', group: 'main' }),
    defineField({ name: 'subtitleEn', title: 'Undertittel (engelsk)', type: 'string', group: 'main' }),
    defineField({
      name: 'intro',
      title: 'Introtekst',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'Du kan bruke {jente}, {gutt} og {gard}. Navnene hentes fra innstillingene.',
    }),
    defineField({ name: 'introEn', title: 'Introtekst (engelsk)', type: 'text', rows: 3, group: 'main' }),
    defineField({
      name: 'heroImage',
      title: 'Forsidebilde',
      type: 'image',
      group: 'main',
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
    defineField({
      name: 'mapImage',
      title: 'Kart over gården',
      type: 'image',
      group: 'main',
      description: 'Hele gården sett ovenfra, liggende 4:3 (for eksempel 2000 × 1500 px), uten juletre og uten stedsknapper. Spillet legger treet og knappene oppå. Plasseringen av hvert sted angis under «Steder» (fra venstre og fra toppen, i prosent).',
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),
    defineField({
      name: 'palette',
      title: 'Farger',
      type: 'object',
      group: 'main',
      description: 'Fargekoder (#rrggbb). Tomme felt beholder julefargene.',
      fields: [
        defineField({ name: 'sky', title: 'Himmel / mørk bakgrunn', type: 'string' }),
        defineField({ name: 'ground', title: 'Bakke / lys flate', type: 'string' }),
        defineField({ name: 'accent', title: 'Hovedfarge (knapper)', type: 'string' }),
        defineField({ name: 'accent2', title: 'Tilleggsfarge', type: 'string' }),
        defineField({ name: 'glow', title: 'Lysfarge', type: 'string' }),
      ],
    }),
    defineField({
      name: 'collectionName',
      title: 'Det som samles',
      type: 'string',
      group: 'main',
      description: 'For eksempel «Juletreet» eller «Påskekurven».',
    }),
    defineField({ name: 'collectionNameEn', title: 'Det som samles (engelsk)', type: 'string', group: 'main' }),
    defineField({ name: 'collectionTop', title: 'Toppen når alt er samlet (emoji)', type: 'string', group: 'main' }),

    defineField({ name: 'places', title: 'Steder', type: 'array', of: [place], group: 'places' }),

    defineField({ name: 'finaleTitle', title: 'Avslutning: tittel', type: 'string', group: 'finale' }),
    defineField({ name: 'finaleTitleEn', title: 'Avslutning: tittel (engelsk)', type: 'string', group: 'finale' }),
    defineField({ name: 'finale', title: 'Avslutning: replikker', type: 'array', of: [line], group: 'finale' }),
    defineField({ name: 'loftName', title: 'Navn på det hemmelige stedet', type: 'string', group: 'finale', description: 'For eksempel «Nisseloftet».' }),
    defineField({ name: 'loftNameEn', title: 'Navn på det hemmelige stedet (engelsk)', type: 'string', group: 'finale' }),
    defineField({
      name: 'showWords',
      title: 'Trylleord til forestillingen',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'finale',
      description: 'Spilleren velger ett av dem. Uten utropstegn.',
    }),
    defineField({ name: 'showWordsEn', title: 'Trylleord (engelsk)', type: 'array', of: [defineArrayMember({ type: 'string' })], group: 'finale' }),
    defineField({
      name: 'kitSlug',
      title: 'Sesongens tryllesett (slug)',
      type: 'string',
      group: 'finale',
      description: 'Slug-en til tryllesettet i «Bak teppet (lukket)» som åpnes når spillet er ferdig. Bare tryllebeskrivelser i dette settet kan vises i spillet.',
    }),
  ],
  preview: {
    select: { title: 'title', key: 'key', visible: 'isVisible', media: 'heroImage' },
    prepare({ title, key, visible, media }: { title?: string; key?: string; visible?: boolean; media?: any }) {
      return { title: (visible === false ? '⚪ ' : '') + (title || `Sesong: ${key || '?'}`), subtitle: `Nøkkel: ${key || '—'}`, media }
    },
  },
})
