// schemaTypes/farmGameConfig.ts
//
// Settings for the children's game "Tryllegården" (/barn/tryllegarden).
// Concept: docs/tryllegarden-concept.md. Public dataset: nothing here is
// secret. The game's texts and places are season packs (farmSeason.ts); the
// tricks' methods are tryllebeskrivelser in the "Bak teppet (lukket)"
// workspace.
import { defineType, defineField } from 'sanity'

export const farmGameConfig = defineType({
  name: 'farmGameConfig',
  title: 'Tryllegården: Innstillinger',
  type: 'document',
  icon: () => '🏡',
  description:
    'Én felles innstilling for barnespillet «Tryllegården». Opprett bare ett dokument av denne typen.',
  fields: [
    defineField({
      name: 'isActive',
      title: 'Spillet er aktivt',
      type: 'boolean',
      initialValue: false,
      description:
        'Hovedbryteren. Av: /barn/tryllegarden viser «kommer snart», og spillet er ikke lenket fra barnesiden. På: spillet er åpent for alle. For å teste mens bryteren er av: bruk forhåndsvisningslenken fra «Bak teppet (lukket)» → «Spill: Forhåndsvisning», med adressen /barn/tryllegarden?forhandsvisning=<kode>.',
    }),

    defineField({
      name: 'activeSeason',
      title: 'Sesong som vises',
      type: 'string',
      initialValue: 'jul',
      description:
        'Nøkkelen til sesongen som spilles nå, for eksempel «jul». Julesesongen ligger ferdig i koden; andre sesonger lages som «Tryllegården: Sesong» med samme nøkkel som skrives her.',
      validation: R => R.regex(/^[a-z0-9-]+$/).error('Bare små bokstaver, tall og bindestrek.'),
    }),

    defineField({
      name: 'farmName',
      title: 'Gårdens navn',
      type: 'string',
      initialValue: 'Årvoll gård',
      description: 'Settes inn der tekstene har {gard}.',
    }),
    defineField({
      name: 'girlName',
      title: 'Navn på tryllejenta',
      type: 'string',
      initialValue: 'Tiril',
      description: 'Settes inn der tekstene har {jente}. Kan byttes når som helst; ingen tekster må skrives om.',
    }),
    defineField({
      name: 'boyName',
      title: 'Navn på tryllegutten',
      type: 'string',
      initialValue: 'Trym',
      description: 'Settes inn der tekstene har {gutt}.',
    }),

    defineField({
      name: 'comingSoonTitle',
      title: '«Kommer snart»-tittel',
      type: 'string',
      description: 'Vises mens spillet er av. Tomt felt gir standardteksten.',
    }),
    defineField({
      name: 'comingSoonText',
      title: '«Kommer snart»-tekst',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'englishEnabled',
      title: 'Vis engelsk språkvalg i spillet',
      type: 'boolean',
      initialValue: false,
      description:
        'Knappene i spillet finnes på engelsk, men stedenes tekster må oversettes i sesongen (feltene merket «engelsk») før denne slås på. Tekster uten oversettelse vises på norsk.',
    }),
  ],

  preview: {
    select: { isActive: 'isActive', season: 'activeSeason' },
    prepare({ isActive, season }: { isActive?: boolean; season?: string }) {
      return {
        title: 'Tryllegården: Innstillinger',
        subtitle: `${isActive ? '🟢 Aktivt' : '⚪ Ikke aktivt (kommer snart)'} · sesong: ${season || 'jul'}`,
      }
    },
  },
})
