import type { TranslationMessages } from '../types'
import { analytics } from './analytics'
import { catalog } from './catalog'
import { clients } from './clients'
import { common } from './common'
import { dashboard } from './dashboard'
import { journal } from './journal'
import { settings } from './settings'
import { business } from './business'

export const kk: TranslationMessages = {
  ...common,
  ...dashboard,
  ...catalog,
  ...journal,
  ...clients,
  ...analytics,
  ...settings,
  ...business,
}
