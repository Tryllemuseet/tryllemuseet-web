// schemaTypes/gameConfig.ts
import { defineType, defineField } from 'sanity'

export const gameConfig = defineType({
  name: 'gameConfig',
  title: 'Kabinettet: Innstillinger',
  type: 'document',
  icon: () => '🃏',
  description:
    'Én felles innstilling for spillet «Det trettende kabinett». Opprett bare ett dokument av denne typen.',
  fields: [

    // ── HOVEDBRYTER ───────────────────────────────────────────────
    defineField({
      name:         'isActive',
      title:        'Spillet er aktivt',
      type:         'boolean',
      initialValue: false,
      description:
        'Hovedbryteren. Av: /det-trettende-kabinett viser «kommer snart» og spillet er skjult fra menyen. På: spillet er live. Husk at nettsiden må bygges på nytt (skjer automatisk hver natt).',
    }),

    // ── TEKSTER (NORSK) ───────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Det trettende kabinett',
    }),

    defineField({
      name: 'intro',
      title: 'Introtekst',
      type: 'text',
      rows: 3,
      initialValue:
        'Et tryllemuseum som bare finnes mellom midnatt og daggry. Direktøren tar opp én lærling per generasjon — og i natt står dørene åpne.',
    }),

    defineField({
      name: 'comingSoonTitle',
      title: '«Kommer snart»-tittel',
      type: 'string',
      initialValue: 'Dørene er ennå låst …',
      description: 'Vises på /det-trettende-kabinett så lenge spillet ikke er aktivt.',
    }),

    defineField({
      name: 'comingSoonText',
      title: '«Kommer snart»-tekst',
      type: 'text',
      rows: 3,
      initialValue:
        'Det trettende kabinett åpner snart for sin neste lærling. Kom tilbake litt senere — eller besøk oss på Årvoll gård i mellomtiden!',
    }),

    // ── ENGELSK (VALGFRITT) ───────────────────────────────────────
    // The game launches in Norwegian; these fields let editors prepare
    // the English copy ahead of an /en/ version (decided July 2026).
    defineField({
      name:         'englishEnabled',
      title:        'Vis engelsk språkvalg i spillet',
      type:         'boolean',
      initialValue: false,
      fieldset:     'english',
      description:
        'På: spillet får en «In English»-knapp som bytter alt spillinnhold til engelsk. ' +
        'Slå på først når de engelske tekstene er kvalitetssikret. Krever ny bygging av nettsiden.',
    }),
    defineField({
      name: 'titleEn',
      title: 'Tittel (engelsk)',
      type: 'string',
      fieldset: 'english',
    }),
    defineField({
      name: 'introEn',
      title: 'Introtekst (engelsk)',
      type: 'text',
      rows: 3,
      fieldset: 'english',
    }),
    defineField({
      name: 'comingSoonTitleEn',
      title: '«Kommer snart»-tittel (engelsk)',
      type: 'string',
      fieldset: 'english',
    }),
    defineField({
      name: 'comingSoonTextEn',
      title: '«Kommer snart»-tekst (engelsk)',
      type: 'text',
      rows: 3,
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
    select: { isActive: 'isActive' },
    prepare({ isActive }: { isActive?: boolean }) {
      return {
        title: 'Kabinettet: Innstillinger',
        subtitle: isActive ? '🟢 Aktivt' : '⚪ Ikke aktivt (kommer snart)',
      }
    },
  },
})
