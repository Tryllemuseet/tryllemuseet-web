// schemaTypes/quizConfig.ts
import { defineType, defineField } from 'sanity'

export const quizConfig = defineType({
  name: 'quizConfig',
  title: 'Quiz: Innstillinger',
  type: 'document',
  icon: () => '🎛️',
  description: 'Én felles innstilling for tryllequizen. Opprett bare ett dokument av denne typen.',
  fields: [

    // ── HOVEDBRYTER ───────────────────────────────────────────────
    defineField({
      name:         'isActive',
      title:        'Quizen er aktiv',
      type:         'boolean',
      initialValue: false,
      description:  'Hovedbryteren. Av: /tryllequiz viser «kommer snart» og quizen er skjult fra menyen. På: quizen er live. Husk at nettsiden må bygges på nytt (skjer automatisk hver natt).',
    }),

    // ── TEKSTER ───────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Tryllequiz',
    }),

    defineField({
      name: 'intro',
      title: 'Introtekst',
      type: 'text',
      rows: 3,
      initialValue: 'Hvor mye kan du om magiens verden? Velg tema og vanskelighetsgrad — og test deg selv!',
    }),

    defineField({
      name: 'comingSoonTitle',
      title: '«Kommer snart»-tittel',
      type: 'string',
      initialValue: 'Tryllequizen kommer snart!',
      description: 'Vises på /tryllequiz så lenge quizen ikke er aktiv.',
    }),

    defineField({
      name: 'comingSoonText',
      title: '«Kommer snart»-tekst',
      type: 'text',
      rows: 3,
      initialValue: 'Vi jobber med spørsmålene bak sceneteppet. Kom tilbake litt senere — eller besøk oss på Årvoll gård i mellomtiden!',
    }),

    // ── SPILLREGLER ───────────────────────────────────────────────
    defineField({
      name: 'questionsPerRound',
      title: 'Spørsmål per runde',
      type: 'number',
      initialValue: 10,
      validation: R => R.min(3).max(30),
      description: 'Hvor mange tilfeldige spørsmål en runde består av. Finnes det færre spørsmål i valgt tema/vanskelighetsgrad, brukes alle som finnes.',
    }),

    // ── RESULTATNIVÅER ────────────────────────────────────────────
    defineField({
      name: 'resultLevels',
      title: 'Resultatnivåer',
      type: 'array',
      description: 'Tittel og melding per poengnivå. «Fra prosent» er nedre grense — nivået med høyest grense under eller lik resultatet brukes.',
      of: [{
        type: 'object',
        name: 'resultLevel',
        fields: [
          defineField({
            name: 'minPercent',
            title: 'Fra prosent',
            type: 'number',
            validation: R => R.required().min(0).max(100),
          }),
          defineField({ name: 'title', title: 'Tittel', type: 'string', validation: R => R.required() }),
          defineField({ name: 'message', title: 'Melding', type: 'text', rows: 2 }),
        ],
        preview: {
          select: { title: 'title', minPercent: 'minPercent' },
          prepare({ title, minPercent }: { title?: string; minPercent?: number }) {
            return { title: title ?? '(uten tittel)', subtitle: `Fra ${minPercent ?? 0} %` }
          },
        },
      }],
      initialValue: [
        { _type: 'resultLevel', minPercent: 0,  title: 'Nysgjerrig lærling',     message: 'Alle store magikere startet et sted! Utforsk museet og nettsiden — og prøv igjen.' },
        { _type: 'resultLevel', minPercent: 40, title: 'Lovende tryllekunstner', message: 'Ikke verst! Du kan mer enn de fleste — men magiens verden har flere hemmeligheter å by på.' },
        { _type: 'resultLevel', minPercent: 70, title: 'Erfaren illusjonist',    message: 'Imponerende! Du har god oversikt over magiens verden.' },
        { _type: 'resultLevel', minPercent: 90, title: 'Stormester i magi',      message: 'Simsalabim! Du kan nesten mer enn museet selv. Kom innom, så kan vi lære av deg!' },
      ],
    }),

  ],

  preview: {
    select: { isActive: 'isActive' },
    prepare({ isActive }: { isActive?: boolean }) {
      return {
        title: 'Quiz: Innstillinger',
        subtitle: isActive ? '🟢 Aktiv' : '⚪ Ikke aktiv (kommer snart)',
      }
    },
  },
})
