import { appThemes } from './appThemes'
import type { AppThemeDefinition, AppThemeId } from './types'

export { appThemes }
export type { AppThemeDefinition, AppThemeId }

export const DEFAULT_THEME_ID: AppThemeId = 'cobalt-mandarin'

export function isAppThemeId(value: string | null): value is AppThemeId {
  return appThemes.some((theme) => theme.id === value)
}

export function getAppTheme(id: AppThemeId): AppThemeDefinition {
  return appThemes.find((theme) => theme.id === id) ?? appThemes[0]
}
