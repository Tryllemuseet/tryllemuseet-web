// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // The site stays fully static. The adapter only exists so the few pages
  // that opt out with `export const prerender = false` (the code-protected
  // /bak-teppet area) can run on demand as Vercel functions.
  adapter: vercel(),
  env: {
    schema: {
      // Read-only Sanity token for the private "lukket." documents behind
      // /bak-teppet (see schemaTypes/kitCollection.ts). Read at runtime on
      // the server only — never inlined into client code.
      SANITY_PRIVATE_READ_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  redirects: {
    // Short URLs used on print material / QR codes → canonical paths
    '/got-talent':                  '/tryllehistorie/got-talent',
    '/fool-us':                     '/tryllehistorie/fool-us',
    // "Norske legender" renamed to "Fordypninger" (2026-07) — dekker nå
    // norske og internasjonale artikler, ikke bare norske.
    '/norske-legender':                 '/tryllehistorie/fordypninger',
    '/tryllehistorie/norske-legender':  '/tryllehistorie/fordypninger',
    '/hvem-er-hvem':                '/tryllehistorie/magiens-hvem-er-hvem',
    '/tryllehistorie/hvem-er-hvem': '/tryllehistorie/magiens-hvem-er-hvem',
    // Library moved under /ressurser (2026-07); short URL kept working
    '/bibliotek':                   '/ressurser/bibliotek',
    // Info screen lives as a static file in public/
    '/skjerm':                      '/skjerm.html',
    // Norwegian spelling with "ø" — page route itself uses the ASCII slug
    '/besøk':                       '/besok',
  },
});
