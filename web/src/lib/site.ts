// src/lib/site.ts

// Canonical public origin. The apex (tryllemuseet.no) 308-redirects here, so
// canonical/OG URLs must use www — a canonical that redirects is a mixed
// signal to search engines.
export const SITE_ORIGIN = 'https://www.tryllemuseet.no'

const PRODUCTION_HOSTS = new Set(['tryllemuseet.no', 'www.tryllemuseet.no'])

// Both Vercel projects (test.tryllemuseet.no and tryllemuseet.no) build with
// VERCEL_ENV=production in their own project, so that alone can't tell them
// apart. The project's production domain can: only the real site's project
// has tryllemuseet.no. Fails closed — previews, test and local builds are
// never indexable.
export const isIndexable =
  import.meta.env.PUBLIC_VERCEL_ENV === 'production' &&
  PRODUCTION_HOSTS.has(import.meta.env.PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? '')
