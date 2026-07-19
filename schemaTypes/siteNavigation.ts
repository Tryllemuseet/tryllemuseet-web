// schemaTypes/siteNavigation.ts
import { defineType, defineField } from 'sanity'

const navSubArea = {
  type: 'object',
  name: 'navSubArea',
  title: 'Underområde',
  fields: [
    defineField({ name: 'label', title: 'Tittel', type: 'string', validation: R => R.required() }),
    defineField({
      name: 'link',
      title: 'Lenke',
      type: 'string',
      description: 'Relativ sti, f.eks. /utstillingen/artefakter',
      validation: R => R.required(),
    }),
    defineField({
      name: 'isVisible',
      title: 'Synlig',
      type: 'boolean',
      initialValue: true,
      description: 'Av: skjuler underpunktet fra menyen uten å slette det.',
    }),
    defineField({
      name: 'featureFlag',
      title: 'Koblet til funksjonsbryter',
      type: 'string',
      options: {
        list: [
          { title: 'Ingen', value: 'none' },
          { title: 'Tryllequiz (quizConfig.isActive)', value: 'quiz' },
          { title: 'Det trettende kabinett (gameConfig.isActive)', value: 'game' },
        ],
      },
      initialValue: 'none',
      description: 'Kun for de to spillene: punktet vises bare når BÅDE dette er «Synlig» OG hovedbryteren i quizConfig/gameConfig er aktiv.',
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'link' },
  },
}

const navMainArea = {
  type: 'object',
  name: 'navMainArea',
  title: 'Hovedområde',
  fields: [
    defineField({ name: 'label', title: 'Tittel', type: 'string', validation: R => R.required() }),
    defineField({ name: 'link', title: 'Lenke', type: 'string', validation: R => R.required() }),
    defineField({
      name: 'matchPaths',
      title: 'Stier som markerer dette som aktivt',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Alle stier (inkludert lenken over, hvis den skal telle) som skal gi gyllen uthevning i menyen når man er på en underside. F.eks. Aktiviteter matcher også /barn og /tryllequiz.',
    }),
    defineField({
      name: 'column',
      title: 'Plassering i header (desktop)',
      type: 'string',
      options: {
        list: [
          { title: 'Venstre', value: 'left' },
          { title: 'Høyre', value: 'right' },
        ],
      },
      initialValue: 'left',
      description: 'Styrer kun hvilken side av logoen punktet vises på ved desktop-bredde. Mobilmenyen og footer bruker uansett rekkefølgen i listen under.',
    }),
    defineField({
      name: 'isVisible',
      title: 'Synlig',
      type: 'boolean',
      initialValue: true,
      description: 'Av: skjuler hele hovedområdet (inkl. underområder) fra header, mobilmeny og footer uten å slette det.',
    }),
    defineField({
      name: 'subAreas',
      title: 'Underområder',
      type: 'array',
      description: 'Fritt antall underområder. Rekkefølgen her styrer rekkefølgen i nedtrekksmenyen/mobilmenyen. La stå tom hvis hovedområdet ikke skal ha en nedtrekksmeny.',
      of: [navSubArea],
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'link', subAreas: 'subAreas' },
    prepare({ title, subtitle, subAreas }: { title?: string; subtitle?: string; subAreas?: unknown[] }) {
      const n = subAreas?.length ?? 0
      return { title, subtitle: `${subtitle ?? ''}${n ? ` · ${n} underområder` : ''}` }
    },
  },
}

export const siteNavigation = defineType({
  name: 'siteNavigation',
  title: 'Navigasjon (header/meny)',
  type: 'document',
  icon: () => '🧭',
  description: 'Én felles innstilling for hovedmenyen — styrer header (desktop-dropdown), mobilmeny og footerens «Utforsk»-liste. Opprett bare ett dokument av denne typen.',
  fields: [
    defineField({
      name: 'mainAreas',
      title: 'Hovedområder',
      type: 'array',
      description: 'Rekkefølgen her styrer rekkefølgen i header, mobilmeny og footer.',
      of: [navMainArea],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Navigasjon (header/meny)' }
    },
  },
})
