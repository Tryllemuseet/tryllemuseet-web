// schemaTypes/kitTrick.ts
//
// "Tryllebeskrivelse": one magic trick's instructions (often a Norwegian
// translation of the sheet that comes with the trick), written ONCE and
// referenced from any number of tryllesett (kitCollection.tricks) and from
// other tricks (relatedTricks). Rendered at /bak-teppet/triks/<slug>, which is
// open to anyone who has unlocked at least one kit that includes the trick.
//
// Private like kitCollection: these pages reveal how tricks are done, so the
// documents live under the "lukket." ID path (see privateDoc.ts).
//
// The body is a list of sections rather than fixed fields, because the source
// sheets vary: the steps sometimes belong to "Hemmeligheten", sometimes to
// "Utførelse", and figures can sit in any section. `kind` gives each section
// its default heading and anchor; `heading` overrides the text.
import { defineType, defineField, defineArrayMember } from 'sanity'
import { richBlockContent } from './richBlockContent'
import { privateIdValidation } from './privateDoc'

export const KIT_TRICK_SECTION_KINDS = [
  { title: 'Effekt', value: 'effekt' },
  { title: 'Hemmeligheten', value: 'hemmeligheten' },
  { title: 'Rekvisitter', value: 'rekvisitter' },
  { title: 'Forberedelse', value: 'forberedelse' },
  { title: 'Utførelse', value: 'utforelse' },
  { title: 'Tips', value: 'tips' },
  { title: 'Annet (egen overskrift)', value: 'annet' },
]

const imageWithAlt = (name: string, title: string) => defineField({
  name,
  title,
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt-tekst',
      type: 'string',
      description: 'Beskriv hva bildet viser, for skjermlesere.',
      validation: R => R.required().warning('Bilder bør ha alt-tekst.'),
    }),
  ],
})

const figure = defineArrayMember({
  name: 'kitFigure',
  title: 'Bilde',
  type: 'object',
  fields: [
    imageWithAlt('image', 'Bilde'),
    defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
    defineField({
      name: 'markers',
      title: 'Nummermerker på bildet',
      type: 'array',
      description: 'Valgfritt: små nummerrundinger langs høyre kant av bildet, f.eks. for å vise hvor fingeren skal stå. «Fra toppen» er i prosent av bildehøyden.',
      of: [
        defineArrayMember({
          name: 'kitMarker',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Tekst', type: 'string', validation: R => R.required().max(3) }),
            defineField({ name: 'top', title: 'Fra toppen (%)', type: 'number', validation: R => R.required().min(0).max(100) }),
          ],
          preview: {
            select: { label: 'label', top: 'top' },
            prepare: ({ label, top }: { label?: string; top?: number }) => ({ title: `${label ?? '?'} — ${top ?? '?'} % fra toppen` }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'caption', alt: 'image.alt', media: 'image' },
    prepare: ({ title, alt, media }: { title?: string; alt?: string; media?: unknown }) => ({ title: title || alt || 'Bilde', media: media as never }),
  },
})

const step = defineArrayMember({
  name: 'kitStep',
  title: 'Trinn',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Overskrift (valgfri)', type: 'string', description: 'F.eks. «Å bla fra bunnen av boken».' }),
    defineField({ name: 'text', title: 'Tekst', type: 'array', of: richBlockContent([{ title: 'Normaltekst', value: 'normal' }]) }),
    defineField({ name: 'figures', title: 'Bilder', type: 'array', of: [figure] }),
  ],
  preview: {
    select: { title: 'title', text: 'text', media: 'figures.0.image' },
    prepare: ({ title, text, media }: { title?: string; text?: { children?: { text?: string }[] }[]; media?: unknown }) => ({
      title: title || text?.[0]?.children?.map(c => c.text).join('') || 'Trinn',
      media: media as never,
    }),
  },
})

export const kitTrick = defineType({
  name: 'kitTrick',
  title: 'Tryllebeskrivelse (lukket)',
  type: 'document',
  icon: () => '📜',
  description: 'Bruksanvisning for ett triks. Lages én gang og kan brukes i flere tryllesett.',

  validation: Rule => Rule.custom(privateIdValidation('«Tryllebeskrivelser (lukket)» → «Ny tryllebeskrivelse»')),

  fieldsets: [
    { name: 'source', title: 'Kilde og rettigheter', options: { collapsible: true, collapsed: false } },
  ],

  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Vis på nettsiden',
      type: 'boolean',
      initialValue: true,
      description: 'Av: beskrivelsen skjules i alle tryllesett, uten å slettes.',
    }),

    // ── HODE ──────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Norsk navn på trikset, f.eks. «Melkeforsvinning».',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Adressen blir /bak-teppet/triks/<slug>. Ikke endre den etter at lenker er delt.',
      validation: R => R.required(),
    }),
    defineField({
      name: 'originalTitle',
      title: 'Originaltittel',
      type: 'string',
      description: 'F.eks. «Milk Vanishment · 牛奶消失». Vises under tittelen.',
    }),
    defineField({
      name: 'lead',
      title: 'Ingress',
      type: 'text',
      rows: 2,
      description: 'Én setning om hva som skjer. Vises under tittelen og på kortet i tryllesettet.',
    }),
    defineField({
      name: 'notice',
      title: 'Merknad øverst',
      type: 'text',
      rows: 3,
      description: 'Vises i en ramme øverst, f.eks. «Denne siden er en norsk oversettelse av bruksanvisningen … Siden avslører hemmeligheten bak trikset.»',
    }),
    defineField({
      name: 'noticeLabel',
      title: 'Merknadens etikett',
      type: 'string',
      initialValue: 'Oversettelse.',
      description: 'Uthevet ord først i merknaden. La stå tomt for ingen etikett.',
      hidden: ({ document }) => !document?.notice,
    }),
    imageWithAlt('coverImage', 'Kortbilde'),

    // ── INNHOLD ───────────────────────────────────────────────────
    defineField({
      name: 'sections',
      title: 'Seksjoner',
      type: 'array',
      description: 'I den rekkefølgen de skal vises. Vanlig rekkefølge: Effekt, Hemmeligheten, Rekvisitter, Forberedelse, Utførelse, Tips.',
      of: [
        defineArrayMember({
          name: 'kitTrickSection',
          title: 'Seksjon',
          type: 'object',
          fields: [
            defineField({
              name: 'kind',
              title: 'Type',
              type: 'string',
              options: { list: KIT_TRICK_SECTION_KINDS },
              initialValue: 'effekt',
              validation: R => R.required(),
            }),
            defineField({
              name: 'heading',
              title: 'Overskrift',
              type: 'string',
              description: 'Tomt: typens navn brukes. Fyll ut for f.eks. «Forberedelse før fremføringen».',
              validation: R => R.custom((value, ctx) =>
                (ctx.parent as { kind?: string } | undefined)?.kind === 'annet' && !value
                  ? 'Seksjoner av typen «Annet» må ha overskrift.'
                  : true),
            }),
            defineField({ name: 'body', title: 'Tekst', type: 'array', of: richBlockContent() }),
            defineField({
              name: 'listItems',
              title: 'Nummerert liste',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Enkel liste, f.eks. rekvisitter.',
            }),
            defineField({ name: 'figures', title: 'Bilder', type: 'array', of: [figure] }),
            defineField({ name: 'steps', title: 'Trinn', type: 'array', of: [step] }),
            defineField({
              name: 'stepLayout',
              title: 'Visning av trinn',
              type: 'string',
              options: {
                list: [
                  { title: 'Liste (tekst, så bilde under)', value: 'list' },
                  { title: 'Kort (bilde øverst, side om side på stor skjerm)', value: 'cards' },
                ],
                layout: 'radio',
              },
              initialValue: 'list',
              hidden: ({ parent }) => !(parent as { steps?: unknown[] } | undefined)?.steps?.length,
            }),
          ],
          preview: {
            select: { kind: 'kind', heading: 'heading', steps: 'steps', media: 'figures.0.image' },
            prepare: ({ kind, heading, steps, media }: { kind?: string; heading?: string; steps?: unknown[]; media?: unknown }) => ({
              title: heading || KIT_TRICK_SECTION_KINDS.find(k => k.value === kind)?.title || 'Seksjon',
              subtitle: steps?.length ? `${steps.length} trinn` : undefined,
              media: media as never,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: 'videos',
      title: 'Videoer',
      type: 'array',
      description: 'YouTube («Ikke oppført») eller Vimeo vises innebygd; andre lenker vises som lenke.',
      of: [
        defineArrayMember({
          name: 'kitVideo',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Tittel', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: R => R.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        }),
      ],
    }),

    defineField({
      name: 'relatedTricks',
      title: 'Relaterte tryllebeskrivelser',
      type: 'array',
      description: 'Vises nederst som «Se også». Lenken åpnes bare for den som har et tryllesett med det trikset.',
      of: [{ type: 'reference', to: [{ type: 'kitTrick' }], options: { disableNew: true } }],
      validation: R => R.unique(),
    }),

    // ── KILDE ─────────────────────────────────────────────────────
    defineField({
      name: 'sourceText',
      title: 'Om kilden og oversettelsen',
      type: 'array',
      of: richBlockContent([{ title: 'Normaltekst', value: 'normal' }]),
      fieldset: 'source',
    }),
    defineField({
      name: 'sourceFacts',
      title: 'Fakta om kilden',
      type: 'array',
      fieldset: 'source',
      description: 'Par av etikett og verdi, f.eks. Produkt, Produsent, Kontakt, Originaltittel, Språk.',
      of: [
        defineArrayMember({
          name: 'kitFact',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Etikett', type: 'string', validation: R => R.required() }),
            defineField({ name: 'value', title: 'Verdi', type: 'string', validation: R => R.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'rightsNote',
      title: 'Rettigheter og advarsler',
      type: 'text',
      rows: 3,
      fieldset: 'source',
      description: 'Liten tekst nederst, f.eks. «Alle rettigheter til originalteksten og tegningene tilhører rettighetshaveren.»',
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'originalTitle', visible: 'isVisible', media: 'coverImage' },
    prepare({ title, subtitle, visible, media }: { title?: string; subtitle?: string; visible?: boolean; media?: unknown }) {
      return {
        title: (visible === false ? '⚪ ' : '') + (title ?? '(uten tittel)'),
        subtitle,
        media: media as never,
      }
    },
  },
})
