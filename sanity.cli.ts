import {defineCliConfig} from 'sanity/cli'
export default defineCliConfig({
  api: {
    projectId: 'n2ynpgty',
    // Matches sanity.config.ts — set SANITY_STUDIO_DATASET in .env to target
    // another dataset locally. Leave unset before `npm run deploy`: that
    // publishes to the live studioHost below, which should stay on production.
    dataset: process.env.SANITY_STUDIO_DATASET || 'production'
  },
  studioHost: 'tryllemuseet-no',
  deployment: {
    autoUpdates: true,
    appId: 'k7a55u9l8zl8p20iydga1tis',
  }
})
