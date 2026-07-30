// schemaTypes/youtubeSource.ts
import { defineType, defineField } from 'sanity'

export const youtubeSource = defineType({
  name: 'youtubeSource',
  title: 'YouTube-kilde (synk)',
  type: 'document',
  icon: () => '📡',
  description: 'En YouTube-kanal som den daglige synk-jobben henter historiske opptak fra. Legg til en ny for å abonnere på flere kanaler — ingen kodeendring nødvendig.',
  fields: [

    defineField({
      name: 'isActive',
      title: 'Aktiv i synk',
      type: 'boolean',
      initialValue: true,
      description: 'Av: kanalen hoppes over ved neste synk-kjøring, uten å slette allerede importerte opptak.',
    }),

    defineField({
      name: 'name',
      title: 'Visningsnavn',
      type: 'string',
      description: 'F.eks. «Egelos videosamling». Brukt internt i Studio og i loggen fra synk-jobben.',
      validation: R => R.required(),
    }),

    defineField({
      name: 'channelId',
      title: 'YouTube kanal-ID',
      type: 'string',
      description: 'Den stabile kanal-IDen (starter med "UC…"), ikke @handle. Finnes f.eks. via kanalens "Om"-side → "Del kanal" → "Kopier kanal-ID".',
      validation: R => R.required().regex(/^UC[\w-]{22}$/, { name: 'YouTube kanal-ID', invert: false }),
    }),

    defineField({
      name: 'channelHandle',
      title: 'Kanal-handle',
      type: 'string',
      description: 'F.eks. «@Egelosvideosamling». Brukes til kreditering/lenke på oversiktssiden.',
    }),

    defineField({
      name: 'sourceLabel',
      title: 'Kildetekst',
      type: 'string',
      description: 'Settes i «Kilde / samling»-feltet på nye opptak fra denne kanalen, f.eks. «Egelos videosamling (@Egelosvideosamling)».',
      validation: R => R.required(),
    }),

  ],

  preview: {
    select: { name: 'name', handle: 'channelHandle', active: 'isActive' },
    prepare({ name, handle, active }: { name?: string; handle?: string; active?: boolean }) {
      return {
        title: (active === false ? '⚪ ' : '🟢 ') + (name ?? '(uten navn)'),
        subtitle: handle,
      }
    },
  },
})
