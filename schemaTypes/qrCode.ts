// schemaTypes/qrCode.ts
import { defineType, defineField } from 'sanity'

export const qrCode = defineType({
  name: 'qrCode',
  title: 'QR-kode',
  type: 'document',
  icon: () => '🔗',
  fields: [
    defineField({
      name: 'qrNumber',
      title: 'QR-kodenummer',
      type: 'number',
      description: 'Nummeret trykt på den fysiske QR-koden i museet. Selve koden skal peke til https://tryllemuseet.no/qr/{nummer}.',
      validation: R => R.required().min(1).custom(async (value, context) => {
        if (value == null) return true
        const client = context.getClient({ apiVersion: '2024-01-01' })
        const id = (context.document?._id ?? '').replace(/^drafts\./, '')
        const conflict = await client.fetch(
          `count(*[_type == "qrCode" && qrNumber == $value && !(_id in [$id, "drafts." + $id])])`,
          { value, id }
        )
        return conflict === 0 || `QR-kodenummer ${value} er allerede i bruk av en annen QR-kode.`
      }),
    }),

    defineField({
      name: 'target',
      title: 'Peker til (Fordypning)',
      type: 'reference',
      to: [{ type: 'legend' }],
      description: 'Søk opp artikkelen QR-koden skal lenke til — kun artikler med gyldig URL-slug vises som treff. Bruk dette ELLER Fast side-URL under, ikke begge.',
      options: {
        filter: 'defined(slug.current)',
        disableNew: true,
      },
      validation: R => R.custom((value, context) => {
        const doc = context.document as { customPath?: string } | undefined
        if (!value && !doc?.customPath) return 'Fyll ut enten Peker til (Fordypning) eller Fast side-URL.'
        if (value && doc?.customPath) return 'Fyll ut kun én av Peker til (Fordypning) og Fast side-URL, ikke begge.'
        return true
      }),
    }),

    defineField({
      name: 'customPath',
      title: 'Fast side-URL',
      type: 'string',
      description: 'Bruk denne i stedet for «Peker til» hvis QR-koden skal peke til en fast side på nettsiden, ikke en Fordypning-artikkel — f.eks. /tryllehistorie. Må starte med "/".',
      validation: R => R.custom((value, context) => {
        if (value == null || value === '') return true
        if (!value.startsWith('/')) return 'Må starte med "/", f.eks. /tryllehistorie.'
        const doc = context.document as { target?: unknown } | undefined
        if (doc?.target) return 'Fyll ut kun én av Peker til (Fordypning) og Fast side-URL, ikke begge.'
        return true
      }),
    }),
  ],
  preview: {
    select: {
      qrNumber:      'qrNumber',
      title:         'target.title',
      slug:          'target.slug.current',
      visible:       'target.isVisible',
      physicalOrder: 'target.physicalOrder',
      stations:      'target.stations',
      customPath:    'customPath',
    },
    prepare({ qrNumber, title, slug, visible, physicalOrder, stations, customPath }: {
      qrNumber?: number; title?: string; slug?: string; visible?: boolean
      physicalOrder?: number; stations?: unknown[]; customPath?: string
    }) {
      if (customPath) {
        return {
          title:    `#${qrNumber ?? '–'} → ${customPath}`,
          subtitle: 'Fast side-URL',
        }
      }
      // Speiler NOT_UTSTILLING i web/src/lib/sanity.ts: en artikkel med
      // physicalOrder og/eller stasjoner ruter til /utstillingen, ellers
      // til /tryllehistorie/fordypninger.
      const isUtstilling = physicalOrder != null || (Array.isArray(stations) && stations.length > 0)
      const url = slug
        ? (isUtstilling ? `/utstillingen/${slug}` : `/tryllehistorie/fordypninger/${slug}`)
        : 'Mangler slug/artikkel'
      return {
        title:    `#${qrNumber ?? '–'} → ${title ?? 'Ingen artikkel valgt'}`,
        subtitle: visible === false ? `${url} (⚠️ artikkelen er skjult)` : url,
      }
    },
  },
})
