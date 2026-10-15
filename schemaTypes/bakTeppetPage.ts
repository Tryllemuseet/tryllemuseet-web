// schemaTypes/bakTeppetPage.ts
//
// Texts on the entry page of the closed area /bak-teppet: the hero, the code
// form and the wrong-code message. The area holds tricks and secrets for
// anyone who got a code from the museum: a kit (trylleeske, tryllekoffert),
// a single trick from the shop, or a course. So the wording is general, and
// editors can change it without a code change.
//
// One document, ID "lukket.bak-teppet-page", in the PRIVATE "lukket" dataset
// (Studio workspace "Bak teppet (lukket)" → «Om området (forsiden)»), next to
// the kits it describes. Every field is optional: the page falls back to the
// defaults below (BAK_TEPPET_DEFAULTS in web/src/lib/sanity.ts mirrors them).
import { defineType, defineField } from 'sanity'
import { privateIdValidation } from './privateDoc'

export const BAK_TEPPET_PAGE_ID = 'lukket.bak-teppet-page'

export const bakTeppetPage = defineType({
  name: 'bakTeppetPage',
  title: 'Om området (forsiden)',
  type: 'document',
  icon: () => '🎩',
  description: 'Tekstene på inngangssiden til det lukkede området /bak-teppet.',

  validation: Rule => Rule.custom(privateIdValidation('«Om området (forsiden)»')),

  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Overskrift',
      type: 'string',
      placeholder: 'Trylletriks og hemmeligheter',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      placeholder: 'Her finner du forklaringer og videoer til trylletriks fra Tryllemuseet. Skriv inn koden du har fått, så åpnes triksene dine.',
    }),
    defineField({
      name: 'codeHelp',
      title: 'Hvor finner jeg koden?',
      type: 'text',
      rows: 2,
      description: 'Vises over kodefeltet.',
      placeholder: 'Koden står på kortet du fikk sammen med trikset. Du kan også skanne QR-koden på kortet.',
    }),
    defineField({
      name: 'wrongCode',
      title: 'Feil kode',
      type: 'text',
      rows: 2,
      description: 'Vises når koden ikke stemmer.',
      placeholder: 'Koden stemmer ikke. Sjekk at du har skrevet den riktig. Du finner den på kortet du fikk sammen med trikset.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Beskrivelse for nettlesere',
      type: 'string',
      description: 'Kort beskrivelse i sidens metadata. Siden vises aldri i søkemotorer.',
      placeholder: 'Lukket område med trylletriks og hemmeligheter fra Tryllemuseet.',
    }),
  ],

  preview: {
    prepare: () => ({ title: 'Om området (forsiden)', subtitle: 'Tekstene på /bak-teppet' }),
  },
})
