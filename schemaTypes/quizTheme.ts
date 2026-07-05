// schemaTypes/quizTheme.ts
import { defineType, defineField } from 'sanity'

export const quizTheme = defineType({
  name: 'quizTheme',
  title: 'Quiz: Tema',
  type: 'document',
  icon: () => '🗂️',
  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name:         'isVisible',
      title:        'Vis på nettsted',
      type:         'boolean',
      initialValue: true,
      description:  'Skjul temaet (og temavalget) fra quizen uten å slette det. Standard: på.',
    }),

    defineField({
      name: 'title',
      title: 'Temanavn',
      type: 'string',
      description: 'F.eks. «Norske legender», «Magiens historie», «TV-magi».',
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
      name: 'icon',
      title: 'Emoji-ikon',
      type: 'string',
      description: 'Én emoji som vises på temaknappen, f.eks. 🎩 eller 📜.',
      validation: R => R.max(4),
    }),

    defineField({
      name: 'description',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 2,
      description: 'Vises under temanavnet på quizens startside.',
    }),

    defineField({
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavest tall vises først.',
    }),

  ],

  orderings: [
    {
      title: 'Rekkefølge',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],

  preview: {
    select: { title: 'title', icon: 'icon', order: 'order' },
    prepare({ title, icon, order }: { title?: string; icon?: string; order?: number }) {
      return {
        title: [icon, title ?? '(uten navn)'].filter(Boolean).join(' '),
        subtitle: order != null ? `Rekkefølge: ${order}` : '',
      }
    },
  },
})
