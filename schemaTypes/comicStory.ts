// schemaTypes/comicStory.ts
import { defineType, defineField } from 'sanity'

export const comicStory = defineType({
  name: 'comicStory',
  title: 'Interaktiv historie (tegneserie)',
  type: 'document',
  icon: () => '📖',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsted',
      type: 'boolean',
      initialValue: true,
      description: 'Skjul historien fra /barn/historier uten å slette den. Standard: på.',
    }),

    // ── 1. GRUNNINFO ─────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. «Harry Houdini: Mannen, Myten, Legenden»',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),

    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
    }),

    defineField({
      name: 'intro',
      title: 'Ingress',
      type: 'text',
      rows: 3,
      description: 'Introtekst øverst på siden, før første scene.',
    }),

    defineField({
      name: 'creditsNote',
      title: 'Kilde-/kredittekst (footer)',
      type: 'text',
      rows: 2,
      description: 'F.eks. «Historiske foto og plakater: Library of Congress».',
    }),

    // ── 2. SCENER ──────────────────────────────────────────────────
    defineField({
      name: 'scenes',
      title: 'Scener',
      type: 'array',
      description: 'Historien fortalt scene for scene, i den rekkefølgen de skal vises.',
      validation: R => R.required().min(1),
      of: [{
        type: 'object',
        name: 'comicScene',
        title: 'Scene',
        fields: [
          defineField({
            name: 'year',
            title: 'Årstall',
            type: 'string',
            description: 'F.eks. «1899» — vises i tidslinjen.',
          }),
          defineField({
            name: 'chapter',
            title: 'Kapitteltittel',
            type: 'string',
            description: 'F.eks. «4 · Rådet som endret alt»',
            validation: R => R.required(),
          }),
          defineField({
            name: 'image',
            title: 'Hovedbilde',
            type: 'image',
            options: { hotspot: true },
            description: 'Bruk fokuspunkt-verktøyet i Sanity for å styre hvordan bildet beskjæres på ulike skjermstørrelser.',
            validation: R => R.required(),
            fields: [
              defineField({ name: 'alt', title: 'Alt-tekst (tilgjengelighet)', type: 'string', validation: R => R.required() }),
            ],
          }),
          defineField({
            name: 'caption',
            title: 'Bildetekst',
            type: 'string',
            description: 'Kort tekst under hovedbildet.',
          }),
          defineField({
            name: 'narration',
            title: 'Fortellertekst',
            type: 'array',
            description: 'Ett element per avsnitt.',
            validation: R => R.required().min(1),
            of: [{ type: 'text', rows: 3 }],
          }),
          defineField({
            name: 'dialogue',
            title: 'Dialog',
            type: 'array',
            description: 'Valgfritt: replikker mellom personer i scenen.',
            of: [{
              type: 'object',
              name: 'comicDialogueLine',
              fields: [
                defineField({ name: 'speaker', title: 'Hvem snakker', type: 'string', validation: R => R.required() }),
                defineField({ name: 'text', title: 'Replikk', type: 'text', rows: 2, validation: R => R.required() }),
              ],
              preview: {
                select: { title: 'speaker', subtitle: 'text' },
                prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
                  return { title: title ?? '(uten navn)', subtitle }
                },
              },
            }],
          }),
          defineField({
            name: 'hotspots',
            title: 'Klikkbare punkter på hovedbildet',
            type: 'array',
            description: 'Gullmerker barnet kan trykke på i bildet for å lære mer.',
            of: [{
              type: 'object',
              name: 'comicHotspot',
              fields: [
                defineField({
                  name: 'x',
                  title: 'Vannrett posisjon (% fra venstre)',
                  type: 'number',
                  validation: R => R.required().min(0).max(100),
                }),
                defineField({
                  name: 'y',
                  title: 'Loddrett posisjon (% fra toppen)',
                  type: 'number',
                  validation: R => R.required().min(0).max(100),
                }),
                defineField({ name: 'label', title: 'Kort merkelapp', type: 'string', validation: R => R.required() }),
                defineField({ name: 'fact', title: 'Fakta-tekst', type: 'text', rows: 3, validation: R => R.required() }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'fact' },
                prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
                  return { title: title ?? '(uten merkelapp)', subtitle }
                },
              },
            }],
          }),
          defineField({
            name: 'factBox',
            title: 'Faktaboks',
            type: 'object',
            description: 'Valgfri utheva boks, f.eks. «Visste du?» eller «Historisk kontekst».',
            fields: [
              defineField({ name: 'title', title: 'Overskrift', type: 'string' }),
              defineField({ name: 'body', title: 'Tekst', type: 'text', rows: 3 }),
            ],
          }),
          defineField({
            name: 'extraImages',
            title: 'Ekstra bilder',
            type: 'array',
            description: 'Valgfritt: ett eller flere tilleggsbilder til scenen (f.eks. historiske plakater eller foto).',
            of: [{
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', title: 'Alt-tekst (tilgjengelighet)', type: 'string', validation: R => R.required() }),
                defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
              ],
            }],
          }),
        ],
        preview: {
          select: { title: 'chapter', subtitle: 'year', media: 'image' },
          prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: unknown }) {
            return {
              title: title ?? '(uten kapittel)',
              subtitle: subtitle ?? '',
              media,
            }
          },
        },
      }],
    }),

  ],

  orderings: [
    {
      title: 'Tittel (A–Å)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      scenes: 'scenes',
    },
    prepare({ title, subtitle, scenes }: { title?: string; subtitle?: string; scenes?: unknown[] }) {
      return {
        title: title ?? '(uten tittel)',
        subtitle: subtitle ?? `${scenes?.length ?? 0} scener`,
      }
    },
  },
})
