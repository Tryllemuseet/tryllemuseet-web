// schemaTypes/story.ts
import { defineType, defineField } from 'sanity'
import { richBlockContent } from './richBlockContent'

// «Små historier fra tryllekunsten» — short, self-contained anecdotes from
// magic history, published on a roughly weekly cadence. Publishing mechanics
// (publishedAt + featuredDurationDays) mirror historiskeKlippNb: the daily
// rebuild picks up stories automatically once their publish date has passed.
export const story = defineType({
  name: 'story',
  title: 'Liten historie',
  type: 'document',
  icon: () => '✨',

  groups: [
    { name: 'content',  title: 'Innhold', default: true },
    { name: 'some',     title: 'SoMe' },
    { name: 'metadata', title: 'Metadata' },
  ],

  fields: [

    // ── METADATA ──────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul historien fra nettsiden uten å slette den. Standard: på.',
      group:        'metadata',
    }),

    // ── INNHOLD ───────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'F.eks. «Da åndene skapte en tryllekunstner».',
      validation: R => R.required(),
      group: 'content',
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
      group: 'content',
    }),

    defineField({
      name: 'teaser',
      title: 'Ingress / teaser',
      type: 'text',
      rows: 3,
      description: 'Kort tekst som vises i kortlisten og på forsiden. Maks ~200 tegn.',
      validation: R => [R.required(), R.max(220).warning('Anbefalt maks 200 tegn')],
      group: 'content',
    }),

    defineField({
      name: 'body',
      title: 'Historien',
      type: 'array',
      description: 'Selve historien. Støtter lenker, interne lenker til Hvem er hvem og bilder i teksten.',
      validation: R => R.required().min(1),
      of: richBlockContent(),
      group: 'content',
    }),

    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      description: 'Valgfritt. Vises i kortlisten, på forsiden og på historiens egen side.',
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
        defineField({ name: 'caption', title: 'Bildetekst', type: 'string' }),
      ],
      group: 'content',
    }),

    defineField({
      name: 'sourceNote',
      title: 'Kildenote',
      type: 'text',
      rows: 3,
      description: 'Fritekst-kildenote som vises under historien, f.eks. «Peter Lane og Anne Goulden, The Davenport Brothers in Britain 1864–1865 …».',
      group: 'content',
    }),

    defineField({
      name: 'sources',
      title: 'Kildelenker',
      type: 'array',
      of: [{ type: 'sourceItem' }],
      description: 'Valgfrie lenker til kilder på nett.',
      group: 'content',
    }),

    defineField({
      name: 'mentionedMagicians',
      title: 'Omtalte tryllekunstnere',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'biography' }] }],
      description: 'Tryllekunstnere omtalt i historien — lenkes automatisk til «Hvem er hvem»-profilen.',
      group: 'content',
    }),

    // ── PUBLISERING ───────────────────────────────────────────────
    defineField({
      name: 'publishedAt',
      title: 'Publiseres på tryllemuseet.no',
      type: 'datetime',
      description: 'Sett fremtidig dato for planlagt publisering — historien vises automatisk fra denne datoen. Skriv gjerne flere historier på forskudd med én dato per uke.',
      validation: R => R.required(),
      group: 'metadata',
    }),

    defineField({
      name: 'featuredDurationDays',
      title: 'Fremhevet på forsiden i antall dager',
      type: 'number',
      initialValue: 7,
      description: 'Hvor lenge historien vises som «Ukens historie» på forsiden, regnet fra publiseringsdato. Historien forblir uansett synlig i arkivet permanent.',
      validation: R => R.min(1).integer(),
      group: 'metadata',
    }),

    // ── SOME ──────────────────────────────────────────────────────
    defineField({
      name: 'someText',
      title: 'SoMe-tekst (Instagram/Facebook)',
      type: 'text',
      rows: 6,
      description: 'Ferdig posttekst inkl. emneknagger — kopieres til Meta Business Suite.',
      group: 'some',
    }),

  ],

  orderings: [
    {
      title: 'Publiseringsdato (nyest først)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      media: 'image',
    },
    prepare({ title, publishedAt, media }: { title?: string; publishedAt?: string; media?: any }) {
      return {
        title: title ?? '(uten tittel)',
        subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString('nb-NO') : 'Ingen publiseringsdato',
        media,
      }
    },
  },
})
