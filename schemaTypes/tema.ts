// schemaTypes/tema.ts
//
// Samlingsledd over utstillingen/aktivitetene: et Tema knytter sammen flere
// frittstående innholdstyper som hører til samme opplevelse i museet — f.eks.
// Houdini består av en stasjonsutstilling (legend), en interaktiv historie
// for barn (comicStory) og en quiz (quizTheme). Uten et Tema-dokument var
// disse tre usynlige for hverandre; se docs/redaktor-bruksanvisning.md.
//
// De fleste Fordypninger (enkle portrettartikler uten fysisk plassering,
// tegneserie eller quiz) trenger IKKE noe Tema — de vises som før direkte
// under /tryllehistorie/fordypninger. Tema er et opt-in-verktøy for de
// tilfellene der noe faktisk har flere ben.
import { defineType, defineField } from 'sanity'

export const tema = defineType({
  name: 'tema',
  title: 'Tema',
  type: 'document',
  icon: () => '🧭',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
      description: 'Skjul temaets samleside fra nettstedet uten å slette den. Standard: på. Påvirker ikke synligheten til innholdet temaet peker til — de styres av sine egne "Vis på nettsted"-brytere.',
    }),

    // ── IDENTITET ─────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. «Houdini» eller «Tryllekunstens gullalder».',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Bestemmer adressen til samlesiden: /utstillingen/{slug}',
      validation: R => R.required(),
    }),

    defineField({
      name: 'icon',
      title: 'Emoji-ikon',
      type: 'string',
      description: 'Vises ved siden av tittelen på kort og samleside, f.eks. 🎩',
      validation: R => R.max(4),
    }),

    defineField({
      name: 'intro',
      title: 'Kort intro',
      type: 'text',
      rows: 3,
      description: 'Vises øverst på temaets samleside og på temakortet på /utstillingen. Maks 280 tegn.',
      validation: R => R.max(280),
    }),

    defineField({
      name: 'heroImage',
      title: 'Hovedbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
      ],
    }),

    defineField({
      name: 'physicalPresence',
      title: 'Fysisk tilstedeværelse i museet',
      type: 'string',
      description: 'Kun informativt — styrer ikke hvor innholdet vises, det bestemmes fortsatt av feltene på hvert enkelt dokument (Fordypning osv.).',
      options: {
        list: [
          { title: 'Ingen — kun digitalt', value: 'none' },
          { title: 'Veggpanel(er)', value: 'wallPanel' },
          { title: 'Eget utstillingsrom / stasjoner', value: 'room' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),

    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavest tall vises først på /utstillingen. Valgfritt — temaer uten tall vises sist, sortert på tittel.',
    }),

    // ── INNHOLD ───────────────────────────────────────────────────
    defineField({
      name: 'content',
      title: 'Innhold i temaet',
      type: 'array',
      description: 'Velg fritt blant Fordypninger, interaktive historier, quiz-tema, artefakter og trylleforeninger som hører til dette temaet. Rekkefølgen her styrer rekkefølgen på samlesiden.',
      validation: R => R.min(1),
      of: [
        { type: 'reference', name: 'legendRef', title: 'Fordypning', to: [{ type: 'legend' }] },
        { type: 'reference', name: 'comicStoryRef', title: 'Interaktiv historie (tegneserie)', to: [{ type: 'comicStory' }] },
        { type: 'reference', name: 'quizThemeRef', title: 'Quiz: Tema', to: [{ type: 'quizTheme' }] },
        { type: 'reference', name: 'artifactRef', title: 'Artefakt', to: [{ type: 'artifact' }] },
        { type: 'reference', name: 'magicOrganizationRef', title: 'Trylleforening', to: [{ type: 'magicOrganization' }] },
      ],
    }),

  ],

  orderings: [
    {
      title: 'Rekkefølge',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Tittel (A–Å)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: { title: 'title', subtitle: 'intro', media: 'heroImage', icon: 'icon' },
    prepare({ title, subtitle, media, icon }: { title?: string; subtitle?: string; media?: unknown; icon?: string }) {
      return {
        title: [icon, title ?? '(uten tittel)'].filter(Boolean).join(' '),
        subtitle: subtitle ?? '',
        media,
      }
    },
  },
})
