import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'n2ynpgty',
    dataset: 'production'
  },
  studioHost: 'tryllemuseet-no',
  deployment: {
    autoUpdates: true,
  }
})