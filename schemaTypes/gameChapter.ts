// schemaTypes/gameChapter.ts
import { defineType, defineField } from 'sanity'

// Rooms in "Det trettende kabinett". The puzzle logic for each room lives in
// the frontend code; these documents let editors override the visible copy
// (intro text, "visste du at" facts) per room. A room works without a
// document — the code ships sensible Norwegian defaults.
const ROOM_KEYS = [
  { title: 'Foajeen (prolog — essene)',           value: 'foajeen' },
  { title: 'Sandrommet (oldtiden — 2)',           value: 'sandrommet' },
  { title: 'Speilgangen: Kortet du valgte',       value: 'speilgangen' },
  { title: 'Markedsplassen (middelalder — 3)',    value: 'markedsplassen' },
  { title: 'Epilog (Akt I)',                      value: 'epilog' },
  { title: 'Speilgangen: Galleriet som endrer seg', value: 'galleriet' },
  { title: 'Biblioteket (renessansen — 4)',       value: 'biblioteket' },
  { title: 'Speilgangen: Øyet som lyver',         value: 'oyet' },
  { title: 'Salongen (automatene — 5)',           value: 'salongen' },
  { title: 'Seansen (spiritismen — 6)',           value: 'seansen' },
  { title: 'Epilog (Akt II)',                     value: 'epilog2' },
  { title: 'Speilgangen: Det frie valget',        value: 'frievalget' },
  { title: 'Teateret (utbryterne — 7)',           value: 'teateret' },
  { title: 'Kinoen (Méliès — 8)',                 value: 'kinoen' },
  { title: 'Speilgangen: Ånden på lerretet',      value: 'lerretet' },
  { title: 'Verkstedet (illusjonsbyggerne — 9)',  value: 'verkstedet' },
  { title: 'Epilog (Akt III)',                    value: 'epilog3' },
  { title: 'Speilgangen: Minnet som dikter',      value: 'minnet' },
  { title: 'Studioet (TV-mentalisme — 10)',       value: 'studioet' },
  { title: 'Speilgangen: Trekanten som ikke finnes', value: 'trekanten' },
  { title: 'Gatehjørnet (nærmagi — knekt)',       value: 'gatehjornet' },
  { title: 'Speilgangen: Fargene som lyver',      value: 'fargene' },
  { title: 'Vinterhagen (Norden — dame)',         value: 'vinterhagen' },
  { title: 'Epilog (Akt IV)',                     value: 'epilog4' },
  { title: 'Porten (finalen — terskelen)',        value: 'porten' },
  { title: 'Det trettende kabinettet (konge)',    value: 'kabinettet' },
  { title: 'Daggry (finalens epilog)',            value: 'daggry' },
]

export const gameChapter = defineType({
  name: 'gameChapter',
  title: 'Kabinettet: Rom',
  type: 'document',
  icon: () => '🚪',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Bruk på nettsted',
      type:         'boolean',
      initialValue: true,
      description:
        'Av: spillet bruker standardtekstene fra koden i stedet for dette dokumentet. Standard: på.',
    }),

    defineField({
      name: 'key',
      title: 'Rom',
      type: 'string',
      options: { list: ROOM_KEYS, layout: 'radio' },
      validation: R => R.required(),
      description:
        'Hvilket rom i spillet dokumentet gjelder. Opprett maks ett dokument per rom — finnes flere, brukes det første.',
    }),

    defineField({
      name: 'title',
      title: 'Romtittel',
      type: 'string',
      description: 'Overstyrer romtittelen i spillet. Tomt felt = standardtekst fra koden.',
    }),

    defineField({
      name: 'intro',
      title: 'Introtekst',
      type: 'text',
      rows: 4,
      description:
        'Direktørens introduksjon til rommet. Tomt felt = standardtekst fra koden.',
    }),

    // ── VISSTE DU AT ──────────────────────────────────────────────
    defineField({
      name: 'facts',
      title: '«Visste du at …»-fakta',
      type: 'array',
      description:
        'Historiske fakta som vises når rommet er løst. Kvalitetssikres av museet før publisering.',
      of: [{
        type: 'object',
        name: 'gameFact',
        fields: [
          defineField({
            name: 'text',
            title: 'Faktatekst',
            type: 'text',
            rows: 2,
            validation: R => R.required(),
          }),
          defineField({ name: 'textEn',    title: 'Faktatekst (engelsk, valgfritt)', type: 'text', rows: 2 }),
          defineField({ name: 'linkUrl',   title: '«Les mer»-lenke (valgfritt)',     type: 'string' }),
          defineField({ name: 'linkLabel', title: 'Lenketekst',                      type: 'string' }),
        ],
        preview: {
          select: { title: 'text' },
        },
      }],
    }),

    // ── ENGELSK (VALGFRITT) ───────────────────────────────────────
    defineField({
      name: 'titleEn',
      title: 'Romtittel (engelsk)',
      type: 'string',
      fieldset: 'english',
    }),
    defineField({
      name: 'introEn',
      title: 'Introtekst (engelsk)',
      type: 'text',
      rows: 4,
      fieldset: 'english',
    }),

  ],

  fieldsets: [
    {
      name: 'english',
      title: 'Engelsk (brukes når engelsk versjon lanseres)',
      options: { collapsible: true, collapsed: true },
    },
  ],

  preview: {
    select: { key: 'key', title: 'title', isVisible: 'isVisible' },
    prepare({ key, title, isVisible }: { key?: string; title?: string; isVisible?: boolean }) {
      const room = ROOM_KEYS.find(r => r.value === key)
      return {
        title: title || room?.title || '(uten rom)',
        subtitle: isVisible === false ? '⚪ Ikke i bruk' : `🚪 ${key ?? ''}`,
      }
    },
  },
})
