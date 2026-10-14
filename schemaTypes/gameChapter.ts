// schemaTypes/gameChapter.ts
import { defineType, defineField } from 'sanity'
import { richBlockContent } from './richBlockContent'
import { privateIdValidation } from './privateDoc'

// Rooms in "Det trettende kabinett". The puzzle mechanics live in the
// frontend code; everything a player could use to skip a puzzle lives here:
// the answer key, the hints, the answer-dependent replies, the explanation
// shown once the room is solved, and the "visste du at" facts (several of
// them give the answer away). The documents are in the PRIVATE "lukket"
// dataset (Studio workspace "Bak teppet (lukket)"), and the web only hands
// them out through /api/kabinett — the solution and facts of a puzzle room
// only after a correct answer (web/src/lib/kabinett.ts). Room titles, intros
// and images are shown on the (public) game page.
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

// Rich text for room intros: paragraphs with links, plus inline images.
// Editors can use this instead of the plain intro field. Reuses the shared
// richBlockContent() block config (so links/internal links work the same as
// everywhere else) but keeps its own image field set, since room images need
// a bilingual altEn field that the shared inline-image config doesn't have.
const richText = (name: string, title: string, description: string, fieldset?: string) =>
  defineField({
    name,
    title,
    type: 'array',
    description,
    ...(fieldset ? { fieldset } : {}),
    of: [
      // No biography links: references can't cross datasets.
      richBlockContent(undefined, { internalLinks: false })[0],
      {
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            title: 'Alternativ tekst',
            type: 'string',
            description: 'Kort beskrivelse av bildet for skjermlesere.',
          }),
          defineField({
            name: 'altEn',
            title: 'Alternativ tekst (engelsk)',
            type: 'string',
          }),
        ],
      },
    ],
  })

export const gameChapter = defineType({
  name: 'gameChapter',
  title: 'Kabinettet: Rom',
  type: 'document',
  icon: () => '🚪',
  validation: Rule => Rule.custom(privateIdValidation('«Kabinettet: Rom» → «Nytt rom»')),
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Bruk på nettsted',
      type:         'boolean',
      initialValue: true,
      description:
        'Skal stå på. Av: rommet vises uten tekst, og spillet kan verken sjekke svar, gi hint eller vise forklaringen i dette rommet.',
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
      description: 'Romtittelen i spillet.',
    }),

    defineField({
      name: 'intro',
      title: 'Introtekst',
      type: 'text',
      rows: 4,
      description: 'Direktørens introduksjon til rommet.',
    }),

    richText(
      'introRich',
      'Introtekst med formatering (valgfritt)',
      'Rik introtekst med lenker og bilder i teksten. Brukes i stedet for «Introtekst» hvis utfylt.',
    ),

    // ── BILDE ─────────────────────────────────────────────────────
    defineField({
      name: 'image',
      title: 'Rombilde (valgfritt)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Stemningsbilde som vises under rommets introtekst — f.eks. en gjenstand eller plakat fra samlingen.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'Kort beskrivelse av bildet for skjermlesere.',
        }),
        defineField({
          name: 'altEn',
          title: 'Alternativ tekst (engelsk)',
          type: 'string',
        }),
      ],
    }),

    // ── VISSTE DU AT ──────────────────────────────────────────────
    defineField({
      name: 'facts',
      title: '«Visste du at …»-fakta',
      type: 'array',
      description:
        'Historiske fakta som vises når rommet er løst — aldri før, siden flere av dem røper svaret. Kvalitetssikres av museet før publisering.',
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
          defineField({ name: 'linkLabelEn', title: 'Lenketekst (engelsk, valgfritt)', type: 'string' }),
          defineField({
            name: 'image',
            title: 'Bilde (valgfritt)',
            type: 'image',
            options: { hotspot: true },
            description: 'Vises i faktaboksen når spilleren åpner den.',
            fields: [
              defineField({ name: 'alt',   title: 'Alternativ tekst',           type: 'string' }),
              defineField({ name: 'altEn', title: 'Alternativ tekst (engelsk)', type: 'string' }),
            ],
          }),
        ],
        preview: {
          select: { title: 'text' },
        },
      }],
    }),

    // ── FASIT ─────────────────────────────────────────────────────
    defineField({
      name: 'answer',
      title: 'Fasit (teknisk)',
      type: 'string',
      fieldset: 'fasit',
      description:
        'Svarnøkkelen spillet sjekker mot. Formatet er bestemt av gåten i koden (web/src/lib/kabinett.ts) — ikke endre uten å ha lest det. Tomt i rom uten gåte.',
    }),
    defineField({
      name: 'hints',
      title: 'Hint («Direktørens hvisken»)',
      type: 'array',
      fieldset: 'fasit',
      description: 'Gis ett og ett når spilleren ber om det. Bruk tre, fra vagt til nesten svaret.',
      of: [{
        type: 'object',
        name: 'gameLine',
        fields: [
          defineField({ name: 'text',   title: 'Hint',            type: 'text', rows: 2, validation: R => R.required() }),
          defineField({ name: 'textEn', title: 'Hint (engelsk)',  type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'text' } },
      }],
    }),
    defineField({
      name: 'responses',
      title: 'Replikker som avhenger av svaret',
      type: 'array',
      fieldset: 'fasit',
      description:
        'Det Direktøren (eller rommet) sier når spilleren svarer, og andre tekster som røper løsningen. «Når» er en teknisk nøkkel fra koden (f.eks. correct, wrong, wrong:urverk, start:laerling) — endre teksten, ikke nøkkelen. {n} byttes ut med antall riktige.',
      of: [{
        type: 'object',
        name: 'gameResponse',
        fields: [
          defineField({ name: 'when',   title: 'Når (teknisk nøkkel)', type: 'string', validation: R => R.required() }),
          defineField({ name: 'text',   title: 'Tekst',                type: 'text', rows: 2 }),
          defineField({ name: 'textEn', title: 'Tekst (engelsk)',      type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'when', subtitle: 'text' } },
      }],
    }),
    defineField({
      name: 'solution',
      title: 'Forklaringen',
      type: 'array',
      fieldset: 'fasit',
      description:
        'Prinsippet Direktøren forklarer når gåten er løst, eller avsløringen i Speilgangens rom.',
      of: [richBlockContent([{ title: 'Normaltekst', value: 'normal' }], { internalLinks: false })[0]],
    }),
    defineField({
      name: 'solutionEn',
      title: 'Forklaringen (engelsk)',
      type: 'array',
      fieldset: 'fasit',
      of: [richBlockContent([{ title: 'Normaltekst', value: 'normal' }], { internalLinks: false })[0]],
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
    richText(
      'introRichEn',
      'Introtekst med formatering (engelsk, valgfritt)',
      'Rik engelsk introtekst med lenker og bilder. Brukes i stedet for «Introtekst (engelsk)» hvis utfylt.',
      'english',
    ),

  ],

  fieldsets: [
    {
      name: 'fasit',
      title: 'Fasit, hint og forklaring (hemmelig — vises bare i spillet)',
      options: { collapsible: true, collapsed: true },
    },
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
