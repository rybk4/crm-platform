import type { TranslationMessages } from '../types'
import { analytics } from './analytics'
import { catalog } from './catalog'
import { clients } from './clients'
import { common } from './common'
import { dashboard } from './dashboard'
import { journal } from './journal'

export const en: TranslationMessages = {
  ...common,
  ...dashboard,
  ...catalog,
  ...journal,
  ...clients,
  ...analytics,
}
