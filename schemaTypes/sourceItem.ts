import { defineType, defineField } from 'sanity'

export const sourceItem = defineType({
  name: 'sourceItem',
  title: 'Kilde',
  type: 'object',
  icon: () => '🔗',
  fields: [
    defineField({
      name: 'sourceRef',
      title: 'Kilde (fra register)',
      type: 'reference',
      to: [{ type: 'source' }],
      description: 'Foretrukket: velg fra kilderegisteret i stedet for å skrive kildebeskrivelsen på nytt. Finnes kilden ikke ennå, opprett den der først.',
    }),
    defineField({
      name: 'label',
      title: 'Kildebeskrivelse (fritekst)',
      type: 'string',
      description: 'Kun hvis kilden ikke finnes i registeret ennå, eller for et sidespesifikt tillegg (f.eks. sidetall). F.eks. "Wikipedia — Harry Houdini (norsk)"',
      validation: R =>
        R.custom((label, context) => {
          const parent = context.parent as { sourceRef?: { _ref?: string } } | undefined
          if (!parent?.sourceRef?._ref && !label) return 'Velg en kilde fra registeret, eller skriv en kildebeskrivelse'
          return true
        }),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Valgfri. Overstyrer eventuell URL på den registrerte kilden, f.eks. for en dyplenke til riktig side/kapittel.',
    }),
  ],
  preview: {
    select: { label: 'label', url: 'url', refTitle: 'sourceRef.title' },
    prepare({ label, url, refTitle }: { label?: string; url?: string; refTitle?: string }) {
      return { title: refTitle ?? label ?? '(uten kilde)', subtitle: url }
    },
  },
})
