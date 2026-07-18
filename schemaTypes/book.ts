import { defineType, defineField } from 'sanity'

export const book = defineType({
  name: 'book',
  title: 'Bok',
  type: 'document',
  icon: () => '📖',

  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul innholdet fra nettsiden uten å slette det. Standard: på.',
    }),

    // ── 1. GRUNNINFO ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: R => R.required(),
    }),

    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
      description: 'Valgfri undertittel, f.eks. "tryllingens historie i Norge"',
    }),

    defineField({
      name: 'year',
      title: 'Utgivelsesår',
      type: 'number',
      validation: R => R.integer().min(1400).max(2100),
    }),

    defineField({
      name: 'yearNote',
      title: 'Årsnotat',
      type: 'string',
      description: 'Fritekst for komplekse årstall, f.eks. "1936–1972" eller "1902, reprint 1944"',
    }),

    // ── 2. FORFATTERE ─────────────────────────────────────────────
    defineField({
      name: 'authors',
      title: 'Forfattere',
      type: 'array',
      description: 'Bruk personreferanse for norske forfattere i registeret, fritekst for alle andre.',
      of: [
        {
          type: 'object',
          name: 'authorEntry',
          title: 'Forfatter',
          fields: [
            defineField({
              name: 'personRef',
              title: 'Person i registeret',
              type: 'reference',
              to: [{ type: 'biography' }],
              description: 'Velg hvis forfatteren finnes i personregisteret (Hvem er hvem)',
            }),
            defineField({
              name: 'nameText',
              title: 'Navn (fritekst)',
              type: 'string',
              description: 'Bruk dette for forfattere som ikke er i personregisteret',
            }),
            defineField({
              name: 'role',
              title: 'Rolle',
              type: 'string',
              options: {
                list: [
                  { title: 'Forfatter',    value: 'author' },
                  { title: 'Medforfatter', value: 'coauthor' },
                  { title: 'Redaktør',     value: 'editor' },
                  { title: 'Illustratør',  value: 'illustrator' },
                  { title: 'Forord',       value: 'foreword' },
                ],
              },
              initialValue: 'author',
            }),
          ],
          preview: {
            select: {
              refName:  'personRef.title',
              textName: 'nameText',
              role:     'role',
            },
            prepare({ refName, textName, role }: { refName?: string; textName?: string; role?: string }) {
              const name      = refName || textName || '(ukjent)'
              const roleLabel = role === 'author' ? '' : ` (${role})`
              return { title: name + roleLabel }
            },
          },
        },
      ],
    }),

    // ── 3. INNHOLD ────────────────────────────────────────────────
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Kuratert norsk beskrivelse. Legg gjerne til språknotat til slutt.',
    }),

    defineField({
      name: 'language',
      title: 'Språk boken er skrevet på',
      type: 'string',
      options: {
        list: [
          { title: 'Norsk',   value: 'no' },
          { title: 'Engelsk', value: 'en' },
          { title: 'Tysk',    value: 'de' },
          { title: 'Fransk',  value: 'fr' },
          { title: 'Annet',   value: 'other' },
        ],
      },
      initialValue: 'en',
    }),

    defineField({
      name: 'languageNote',
      title: 'Språknotat',
      type: 'string',
      description: 'Fritekst, f.eks. "Oversatt fra fransk" eller "Tidligmoderne engelsk"',
    }),

    // ── 4. KATEGORISERING ─────────────────────────────────────────
    defineField({
      name: 'tags',
      title: 'Emneord / tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Historikk',          value: 'historikk' },
          { title: 'Biografi',           value: 'biografi' },
          { title: 'Kortkunst',          value: 'kortkunst' },
          { title: 'Teknikk',            value: 'teknikk' },
          { title: 'Teori',              value: 'teori' },
          { title: 'Mentalisme',         value: 'mentalisme' },
          { title: 'Scenekunst',         value: 'scenekunst' },
          { title: 'Store illusjoner',   value: 'illusjon' },
          { title: 'Myntkunst',          value: 'myntkunst' },
          { title: 'Avsløring',          value: 'avsloering' },
          { title: 'Robert-Houdin',      value: 'robert-houdin' },
          { title: 'Houdini',            value: 'houdini' },
          { title: 'Norsk tryllehistorie', value: 'norsk-historikk' },
        ],
      },
    }),

    defineField({
      name: 'bookType',
      title: 'Boktype',
      type: 'string',
      options: {
        list: [
          { title: 'Norsk bok',                    value: 'norwegian' },
          { title: 'Internasjonal bok',             value: 'international' },
          { title: 'Public domain (gratis nedlast)', value: 'publicDomain' },
        ],
      },
    }),

    defineField({
      name: 'section',
      title: 'Seksjon på nettsiden',
      type: 'string',
      description: 'Brukes til gruppering på listesider',
      options: {
        list: [
          { title: 'Historiske og teoretiske fundamenter', value: 'foundations' },
          { title: 'Robert-Houdins egne skrifter',         value: 'robert-houdin' },
          { title: 'Harry Houdinis historiske verk',       value: 'houdini' },
          { title: 'Fagbøker om teknikk og teori',         value: 'technique' },
          { title: 'Magihistorie',                         value: 'history' },
          { title: 'Biografier',                           value: 'biography' },
          { title: 'Teknikk og instruksjon',               value: 'instruction' },
          { title: 'Teori og presentasjon',                value: 'theory' },
          { title: 'Mentalisme',                           value: 'mentalism' },
          { title: 'Myntkunst',                            value: 'coins' },
          { title: 'Magi som kulturhistorie',              value: 'cultural-history' },
          { title: 'Norsk tryllehistorie',                 value: 'norwegian-history' },
        ],
      },
    }),

    // ── 5. TILGJENGELIGHET OG KILDE ───────────────────────────────
    defineField({
      name: 'availability',
      title: 'Tilgjengelighet',
      type: 'string',
      options: {
        list: [
          { title: 'Tilgjengelig (i trykk)',    value: 'inPrint' },
          { title: 'Gratis nedlastbar',         value: 'freeDownload' },
          { title: 'Sjekk tilgjengelighet',     value: 'checkAvailability' },
          { title: 'Sjelden / antikvarisk',     value: 'rare' },
        ],
      },
    }),

    defineField({
      name: 'externalUrl',
      title: 'Nedlastingslenke / kilde-URL',
      type: 'url',
      description: 'Lenke direkte til selve boken — kun hvis boken er fritt tilgjengelig (archive.org, nb.no, LoC o.l.)',
    }),

    defineField({
      name: 'sourceLabel',
      title: 'Kildebenevnelse',
      type: 'string',
      description: 'Navn på plattformen for nedlastingslenken, f.eks. "Internet Archive" eller "Nasjonalbiblioteket"',
    }),

    defineField({
      name: 'sourceReference',
      title: 'Kildereferanse (bibliografisk)',
      type: 'string',
      description: 'Hvor opplysningene om denne boken er hentet fra, f.eks. "Berthelsen: Bibliografi – Norske Tryllebøker 1798–1982, nr. 44"',
    }),

    defineField({
      name: 'sourceReferenceUrl',
      title: 'Kildereferanse URL',
      type: 'url',
      description: 'Lenke til kilden opplysningene er hentet fra, f.eks. nb.no-lenken til Berthelsens bibliografi',
    }),

    defineField({
      name: 'thumbnailUrl',
      title: 'Thumbnail-URL (ekstern)',
      type: 'url',
      description: 'For archive.org-bøker: https://archive.org/services/img/{identifier}',
    }),

    defineField({
      name: 'coverImage',
      title: 'Forsidebilde (opplastet)',
      type: 'image',
      description: 'For opphavsrettsbeskyttede bøker der ekstern thumbnail ikke finnes',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst (tilgjengelighet)',
          type: 'string',
          description: 'F.eks. "Forsiden av The Illustrated History of Magic"',
        }),
      ],
    }),

    // ── 6. FORLAGSINFO ────────────────────────────────────────────
    defineField({
      name: 'publisher',
      title: 'Forlag',
      type: 'string',
    }),

    defineField({
      name: 'isbn',
      title: 'ISBN',
      type: 'string',
    }),

    defineField({
      name: 'edition',
      title: 'Utgave / opplagsnotat',
      type: 'string',
      description: 'F.eks. "2. utgave, 2006" eller "Dover reprint"',
    }),

    // ── METADATA — kun internt ────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Fremhevet',
      type: 'boolean',
      description: 'Vis øverst eller i kuraterte utvalg på forsiden',
      initialValue: false,
    }),

    defineField({
      name: 'notes',
      title: 'Interne notater (vises ikke på nettsiden)',
      type: 'text',
      rows: 3,
    }),

  ],

  // ── FORHÅNDSVISNING I STUDIO ──────────────────────────────────
  preview: {
    select: {
      title:    'title',
      year:     'year',
      author0:  'authors.0.nameText',
      authorRef0: 'authors.0.personRef.title',
      media:    'coverImage',
    },
    prepare({ title, year, author0, authorRef0, media }: {
      title?: string; year?: number; author0?: string; authorRef0?: string; media?: unknown
    }) {
      const author   = authorRef0 || author0 || '—'
      const subtitle = [author, year].filter(Boolean).join(', ')
      return { title: title ?? '(uten tittel)', subtitle, media }
    },
  },

  // ── SORTERING I STUDIO ────────────────────────────────────────
  orderings: [
    {
      title: 'År (eldst først)',
      name:  'yearAsc',
      by:    [{ field: 'year', direction: 'asc' }],
    },
    {
      title: 'År (nyest først)',
      name:  'yearDesc',
      by:    [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Tittel A–Å',
      name:  'titleAsc',
      by:    [{ field: 'title', direction: 'asc' }],
    },
  ],
})
