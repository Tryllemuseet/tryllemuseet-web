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
import artifact           from './artifact'
import { tvAppearance }   from './tvAppearance'
import { historicalClip } from './historicalClip'

export const schemaTypes = [
  // Sidetyper
  homepage,
  barnPage,
  omOssPage,
  // Dokumenttyper
  magician,
  biography,
  tvAppearance,
  historicalClip,
  book,
  event,
  artifact,
  siteConfig,
  // Objekttyper
  contentSection,
  sourceItem,
]
