import {defineCliConfig} from 'sanity/cli'
export default defineCliConfig({
  api: {
    projectId: 'n2ynpgty',
    dataset: 'production'
  },
  studioHost: 'tryllemuseet-no',
  deployment: {
    autoUpdates: true,
    appId: 'k7a55u9l8zl8p20iydga1tis',
  }
})
