// schemaTypes/index.ts
import { magician }       from './magician'
import { contentSection } from './contentSection'
import { sourceItem }     from './sourceItem'
import { event }          from './event'
import { siteConfig }     from './siteConfig'
import { biography }      from './biography'
import { book }           from './book'
import { homepage }       from './homepage'
import { barnPage }       from './barnPage'
import { omOssPage }      from './omOssPage'

export const schemaTypes = [
  // Sidetyper
  homepage,
  barnPage,
  omOssPage,
  // Dokumenttyper
  magician,
  biography,
  book,
  event,
  siteConfig,
  // Objekttyper
  contentSection,
  sourceItem,
]
