// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  redirects: {
    // Short URLs used on print material / QR codes → canonical paths
    '/got-talent':                  '/tryllehistorie/got-talent',
    '/fool-us':                     '/tryllehistorie/fool-us',
    '/norske-legender':             '/tryllehistorie/norske-legender',
    '/hvem-er-hvem':                '/tryllehistorie/magiens-hvem-er-hvem',
    '/tryllehistorie/hvem-er-hvem': '/tryllehistorie/magiens-hvem-er-hvem',
    // Info screen lives as a static file in public/
    '/skjerm':                      '/skjerm.html',
  },
});
