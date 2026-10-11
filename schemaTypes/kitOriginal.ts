// schemaTypes/kitOriginal.ts
//
// "Originalbeskrivelse": the original instruction sheet for one or more
// tricks (e.g. the leaflet that comes with «Ball & Vase», or a page from a
// Norwegian booklet), kept as a PDF in the museum's archive. Its own document
// type rather than a field on kitTrick, because one sheet often covers
// several tricks (Begerspillet: "punkt 18–21") and one trick can have several
// originals (Begerspillet has two).
//
// Lives in the private "lukket" dataset like the other Bak teppet types (see
// kitCollection.ts), under the "lukket." ID path. The PDF itself is still
// served by an unguessable CDN URL, so `access` decides whether that URL is
// ever put on a page:
//   - archive (default): stored, never shown — third-party sheets are
//     copyrighted, and sharing them with buyers may need permission
//   - closed: linked from the trick page in /bak-teppet, for kit buyers
//   - public: may be shown openly (not used by any public page yet)
import { defineType, defineField } from 'sanity'
import { privateIdValidation } from './privateDoc'

export const KIT_ORIGINAL_ACCESS = [
  { title: 'Kun arkiv (vises ikke)', value: 'archive' },
  { title: 'Vis i lukket område (Bak teppet)', value: 'closed' },
  { title: 'Kan vises offentlig', value: 'public' },
]

const LANGUAGES = [
  { title: 'Norsk', value: 'no' },
  { title: 'Svensk', value: 'sv' },
  { title: 'Dansk', value: 'da' },
  { title: 'Engelsk', value: 'en' },
  { title: 'Tysk', value: 'de' },
  { title: 'Fransk', value: 'fr' },
  { title: 'Italiensk', value: 'it' },
  { title: 'Spansk', value: 'es' },
  { title: 'Kinesisk', value: 'zh' },
  { title: 'Japansk', value: 'ja' },
  { title: 'Annet', value: 'other' },
]

export const kitOriginal = defineType({
  name: 'kitOriginal',
  title: 'Originalbeskrivelse (lukket)',
  type: 'document',
  icon: () => '📜',
  description: 'Original bruksanvisning eller beskrivelse som PDF, til museets arkiv. Kobles til én eller flere tryllebeskrivelser.',

  validation: Rule => [
    Rule.custom(privateIdValidation('«Originalbeskrivelser» → «Ny originalbeskrivelse»')),
    // Showing a third-party sheet needs permission; warn, don't block, so
    // the editor can still save while waiting for an answer.
    Rule.custom(value => {
      const doc = value as { access?: string; museumOwnsRights?: boolean; permission?: { granted?: boolean } } | undefined
      return !doc || !doc.access || doc.access === 'archive' || doc.museumOwnsRights || doc.permission?.granted
        ? true
        : 'Originalen skal vises, men museet eier ikke rettighetene og har ikke registrert tillatelse. Sett tilgang til «Kun arkiv», eller fyll inn tillatelsen.'
    }).warning(),
  ],

  groups: [
    { name: 'main', title: 'Originalen', default: true },
    { name: 'rights', title: 'Rettigheter og tilgang' },
    { name: 'archive', title: 'Arkiv' },
  ],

  fields: [
    defineField({
      name: 'isVisible',
      title: 'Aktiv',
      type: 'boolean',
      initialValue: true,
      group: 'main',
      description: 'Av: skjules overalt, uten at noe slettes.',
    }),

    // ── ORIGINALEN ───────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      group: 'main',
      description: 'Slik den står på originalen, f.eks. «Ball & Vase — Read and keep» eller «Begerspillet (Tryllemuseets hefte)».',
      validation: R => R.required(),
    }),
    defineField({
      name: 'file',
      title: 'PDF',
      type: 'file',
      group: 'main',
      options: { accept: 'application/pdf' },
      description: 'Skann eller foto av hele originalen, samlet i én PDF.',
      validation: R => R.required().warning('Originalbeskrivelsen mangler PDF.'),
    }),
    defineField({
      name: 'languages',
      title: 'Språk',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: { list: LANGUAGES, layout: 'grid' },
    }),
    defineField({
      name: 'publisher',
      title: 'Produsent / utgiver',
      type: 'string',
      group: 'main',
      description: 'F.eks. «DiFattaMagic srl, Italia» eller «Tryllemuseet».',
    }),
    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      group: 'main',
      description: 'Utgivelsesår, om kjent (omtrentlig er greit).',
      validation: R => R.integer().min(1500).max(2100),
    }),
    defineField({
      name: 'productNumber',
      title: 'Produktnr. / SKU',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'covers',
      title: 'Hva originalen dekker',
      type: 'string',
      group: 'main',
      description: 'Valgfritt, når originalen er del av noe større, f.eks. «punkt 18–21» eller «side 4–5».',
    }),

    // ── RETTIGHETER OG TILGANG ───────────────────────────────────
    defineField({
      name: 'access',
      title: 'Tilgang',
      type: 'string',
      group: 'rights',
      initialValue: 'archive',
      options: { list: KIT_ORIGINAL_ACCESS, layout: 'radio' },
      description: 'Standard er «Kun arkiv». Vis bare originalen hvis museet eier rettighetene eller har fått tillatelse.',
      validation: R => R.required(),
    }),
    defineField({
      name: 'rightsHolder',
      title: 'Rettighetshaver',
      type: 'string',
      group: 'rights',
      description: 'Hvem som eier teksten og bildene i originalen.',
    }),
    defineField({
      name: 'museumOwnsRights',
      title: 'Museet eier rettighetene',
      type: 'boolean',
      group: 'rights',
      initialValue: false,
      description: 'Kryss av for museets egne beskrivelser. Da trengs ingen tillatelse for å vise dem.',
    }),
    defineField({
      name: 'permission',
      title: 'Tillatelse til å vise originalen',
      type: 'object',
      group: 'rights',
      hidden: ({ parent }) => Boolean(parent?.museumOwnsRights),
      fields: [
        defineField({ name: 'granted', title: 'Tillatelse er gitt', type: 'boolean', initialValue: false }),
        defineField({ name: 'date', title: 'Dato', type: 'date' }),
        defineField({ name: 'from', title: 'Fra hvem', type: 'string', description: 'Navn og firma.' }),
        defineField({ name: 'note', title: 'Vilkår / notat', type: 'text', rows: 2, description: 'F.eks. «Kun for kjøpere av tryllesettet», og hvor e-posten med tillatelsen ligger.' }),
      ],
    }),

    // ── ARKIV ────────────────────────────────────────────────────
    defineField({
      name: 'archiveNote',
      title: 'Arkivnotat',
      type: 'text',
      rows: 3,
      group: 'archive',
      description: 'Hvor originalen fysisk ligger, hvem som skannet den og når. Vises aldri på nettsiden.',
    }),
  ],

  preview: {
    select: { title: 'title', publisher: 'publisher', year: 'year', access: 'access', visible: 'isVisible' },
    prepare({ title, publisher, year, access, visible }: { title?: string; publisher?: string; year?: number; access?: string; visible?: boolean }) {
      const accessLabel = access === 'closed' ? 'Vises i lukket område' : access === 'public' ? 'Kan vises offentlig' : 'Kun arkiv'
      return {
        title: (visible === false ? '⚪ ' : '') + (title ?? '(uten tittel)'),
        subtitle: [publisher, year, accessLabel].filter(Boolean).join(' · '),
      }
    },
  },
})
