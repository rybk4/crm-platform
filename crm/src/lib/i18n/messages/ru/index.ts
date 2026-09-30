import { analytics } from './analytics'
import { catalog } from './catalog'
import { clients } from './clients'
import { common } from './common'
import { dashboard } from './dashboard'
import { journal } from './journal'
import { settings } from './settings'

// Русский — источник истины: по нему выводится TranslationKey,
// поэтому остальные локали не соберутся без нового ключа.
export const ru = {
  ...common,
  ...dashboard,
  ...catalog,
  ...journal,
  ...clients,
  ...analytics,
  ...settings,
} as const
