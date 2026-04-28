// schemaTypes/index.ts
import { magician }       from './magician'
import { contentSection } from './contentSection'
import { sourceItem }     from './sourceItem'
import { event }          from './event'
import { siteConfig }     from './siteConfig'
import { biography }      from './biography'

export const schemaTypes = [
  // Dokumenttyper
  magician,
  biography,
  event,
  siteConfig,

  // Objekttyper
  contentSection,
  sourceItem,
]
