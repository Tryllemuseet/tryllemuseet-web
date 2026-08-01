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
      description: 'Søk opp artikkelen QR-koden skal lenke til — kun artikler med gyldig URL-slug vises som treff.',
      options: {
        filter: 'defined(slug.current)',
        disableNew: true,
      },
      validation: R => R.required(),
    }),
  ],
  preview: {
    select: {
      qrNumber: 'qrNumber',
      title:    'target.title',
      slug:     'target.slug.current',
      visible:  'target.isVisible',
    },
    prepare({ qrNumber, title, slug, visible }: { qrNumber?: number; title?: string; slug?: string; visible?: boolean }) {
      const url = slug ? `/utstillingen/${slug}` : 'Mangler slug/artikkel'
      return {
        title:    `#${qrNumber ?? '–'} → ${title ?? 'Ingen artikkel valgt'}`,
        subtitle: visible === false ? `${url} (⚠️ artikkelen er skjult)` : url,
      }
    },
  },
})
