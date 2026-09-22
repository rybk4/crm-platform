import type { TranslationKey } from '@/lib/i18n/messages'

export type AppThemeId =
  | 'cobalt-mandarin'
  | 'ink-tomato'
  | 'ultramarine-sun'
  | 'signal-duo'
  | 'bordeaux-ice'
  | 'petrol-apricot'
  | 'aubergine-yellow'
  | 'sky-cherry'
  | 'industrial-orange'

export interface AppThemeDefinition {
  id: AppThemeId
  nameKey: TranslationKey
  shortNameKey: TranslationKey
  descriptionKey: TranslationKey
  fontFamily: string
  displayFontFamily: string
  swatches: readonly [string, string, string]
  tokens: {
    background: string
    surface: string
    surfaceMuted: string
    border: string
    muted: string
    text: string
    primary: string
    onPrimary: string
    accent: string
    onAccent: string
    primarySoft: string
    primaryBorder: string
    sidebar: string
    sidebarText: string
    sidebarMuted: string
    sidebarBorder: string
    sidebarActive: string
    sidebarActiveText: string
    sidebarMarker: string
  }
}
