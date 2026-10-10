// schemaTypes/kitCollection.ts
//
// Closed customer area for the magic kits/boxes the museum sells
// ("Bak teppet", web/src/pages/bak-teppet/). One document per kit TYPE, with
// one shared access code printed in/on every box of that type — no personal
// data, no per-customer logins.
//
// Privacy relies on the document ID, not on this schema: documents must be
// created with an ID under the "lukket." path (e.g. "lukket.3f1c…"). Sanity
// never serves documents whose _id contains a "." to unauthenticated
// requests, even in the public production dataset, so the access code and
// texts can't be read via the public API. structure.ts creates new kits with
// such an ID, and the validation below blocks publishing one that isn't (see
// privateDoc.ts). The tricks themselves are separate kitTrick documents,
// referenced from `tricks`, so one description can be shared by many kits.
// Uploaded images/files are still public-by-URL on Sanity's CDN (unguessable
// URLs) — that's acceptable here; videos should live on YouTube (unlisted)
// or Vimeo (domain-restricted) rather than in Sanity.
import { defineType, defineField } from 'sanity'
import { richBlockContent } from './richBlockContent'
import { privateIdValidation } from './privateDoc'

// Unambiguous characters only (no 0/O, 1/I/L) so codes printed on a card are
// easy to type. 8 chars from 31 symbols ≈ 40 bits — not guessable online.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateAccessCode(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  const chars = Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length])
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

// Must match normalizeAccessCode() in web/src/lib/bakTeppet.ts
function normalizeAccessCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export const kitCollection = defineType({
  name: 'kitCollection',
  title: 'Tryllesett (lukket område)',
  type: 'document',
  icon: () => '🧰',
  description: 'Lukket side for kjøpere av et tryllesett (trylleeske eller tryllekoffert). Én per type sett, med én felles tilgangskode.',

  validation: Rule => Rule.custom(privateIdValidation('«Tryllesett (lukket)» → «Nytt tryllesett»')),

  fields: [

    // ── SYNLIGHET ─────────────────────────────────────────────────
    defineField({
      name: 'isVisible',
      title: 'Aktiv',
      type: 'boolean',
      initialValue: true,
      description: 'Av: koden slutter å virke og siden blir utilgjengelig, uten at innholdet slettes.',
    }),

    // ── GRUNNINFO ─────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Navn på tryllesettet',
      type: 'string',
      description: 'F.eks. «Den store tryllekofferten» eller «Trylleeske for nybegynnere».',
      validation: R => R.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Brukes i adressen etter innlogging (/bak-teppet/<slug>). Ikke hemmelig — det er koden som beskytter siden.',
      validation: R => R.required(),
    }),

    defineField({
      name: 'accessCode',
      title: 'Tilgangskode',
      type: 'string',
      initialValue: generateAccessCode,
      description: 'Trykkes på kortet/QR-koden i esken eller kofferten. Store/små bokstaver, mellomrom og bindestrek spiller ingen rolle. Bytt koden hvis den har spredt seg — da må alle som har logget inn, taste den nye koden.',
      validation: R => R.required().custom(async (value, context) => {
        if (!value) return true
        const normalized = normalizeAccessCode(value)
        if (normalized.length < 8) return 'Koden må ha minst 8 bokstaver/tall.'
        const id = (context.document?._id ?? '').replace(/^drafts\./, '')
        const clash = await context.getClient({ apiVersion: '2024-01-01' }).fetch<string[]>(
          `*[_type == "kitCollection" && !(_id in [$id, $draftId])].accessCode`,
          { id, draftId: `drafts.${id}` },
        )
        return clash.some(c => c && normalizeAccessCode(c) === normalized)
          ? 'Et annet tryllesett bruker allerede denne koden.'
          : true
      }),
    }),

    defineField({
      name: 'coverImage',
      title: 'Bilde av tryllesettet',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' })],
    }),

    defineField({
      name: 'intro',
      title: 'Velkomsttekst',
      type: 'array',
      of: richBlockContent(),
      description: 'Vises øverst etter innlogging.',
    }),

    defineField({
      name: 'contents',
      title: 'I settet finner du',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Enkel liste over det som ligger i esken eller kofferten.',
    }),

    // ── TRYLLEBESKRIVELSER ───────────────────────────────────────
    defineField({
      name: 'tricks',
      title: 'Tryllebeskrivelser i settet',
      type: 'array',
      description: 'Velg blant tryllebeskrivelsene. Samme beskrivelse kan ligge i flere sett, så den skrives bare én gang. Nye lages under «Tryllebeskrivelser (lukket)».',
      of: [{ type: 'reference', to: [{ type: 'kitTrick' }], options: { disableNew: true } }],
      validation: R => R.unique(),
    }),

  ],

  preview: {
    select: { title: 'title', code: 'accessCode', active: 'isVisible', media: 'coverImage' },
    prepare({ title, code, active, media }: { title?: string; code?: string; active?: boolean; media?: unknown }) {
      return {
        title: (active === false ? '⚪ ' : '🟢 ') + (title ?? '(uten navn)'),
        subtitle: code ? `Kode: ${code}` : 'Mangler kode',
        media: media as never,
      }
    },
  },
})
