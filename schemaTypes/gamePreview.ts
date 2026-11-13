// schemaTypes/gamePreview.ts
//
// Preview link for "Det trettende kabinett" while the game is still switched
// off (gameConfig.isActive). Opening /det-trettende-kabinett?forhandsvisning=<code>
// lets that browser play the whole game, on test and production alike, while
// everyone else still sees "Dørene er ennå låst". See
// web/src/lib/kabinettPreview.ts.
//
// One document, ID "lukket.game-preview", in the PRIVATE "lukket" dataset
// (Studio workspace "Bak teppet (lukket)" → «Spill: Forhåndsvisning»):
// the code must not be readable through the public API.
import { defineType, defineField } from 'sanity'
import { privateIdValidation } from './privateDoc'
import { generateAccessCode, normalizeAccessCode } from './kitCollection'

export const GAME_PREVIEW_ID = 'lukket.game-preview'

export const gamePreview = defineType({
  name: 'gamePreview',
  title: 'Spill: Forhåndsvisning',
  type: 'document',
  icon: () => '🔑',
  description: 'Hemmelig lenke for å teste spillene «Det trettende kabinett» og «Tryllegården» før de er åpnet for alle. Samme kode gjelder begge.',

  validation: Rule => Rule.custom(privateIdValidation('«Spill: Forhåndsvisning»')),

  fields: [
    defineField({
      name: 'isActive',
      title: 'Forhåndsvisning er på',
      type: 'boolean',
      initialValue: true,
      description: 'Av: lenkene slutter å virke for alle som har brukt dem. Når et spill er åpnet for alle, gjør denne ingenting for det spillet.',
    }),

    defineField({
      name: 'previewCode',
      title: 'Kode',
      type: 'string',
      initialValue: generateAccessCode,
      description:
        'Lenkene blir https://www.tryllemuseet.no/det-trettende-kabinett?forhandsvisning=<kode> og https://www.tryllemuseet.no/barn/tryllegarden?forhandsvisning=<kode> (eller samme adresser på test.tryllemuseet.no). Store/små bokstaver, mellomrom og bindestrek spiller ingen rolle. Bytt koden hvis en lenke har spredt seg — da slutter alle gamle lenker å virke.',
      validation: R => R.required().custom(value =>
        !value || normalizeAccessCode(value).length >= 8 ? true : 'Koden må ha minst 8 bokstaver/tall.',
      ),
    }),
  ],

  preview: {
    select: { code: 'previewCode', active: 'isActive' },
    prepare({ code, active }: { code?: string; active?: boolean }) {
      return {
        title: (active === false ? '⚪ ' : '🟢 ') + 'Forhåndsvisning av spillene',
        subtitle: code ? `Kode: ${code}` : 'Mangler kode',
      }
    },
  },
})
