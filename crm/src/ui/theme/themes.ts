import type { TranslationKey } from '../../lib/i18n/messages'

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

export const DEFAULT_THEME_ID: AppThemeId = 'cobalt-mandarin'

export const appThemes: readonly AppThemeDefinition[] = [
  {
    id: 'cobalt-mandarin',
    nameKey: 'themeCobaltName',
    shortNameKey: 'themeCobaltShort',
    descriptionKey: 'themeCobaltDescription',
    fontFamily: 'Onest, Arial, sans-serif',
    displayFontFamily: 'Onest, Arial, sans-serif',
    swatches: ['#3046D3', '#FF5A36', '#F2F4F7'],
    tokens: {
      background: '#F2F4F7',
      surface: '#FFFFFF',
      surfaceMuted: '#E9ECF2',
      border: '#C9CED8',
      muted: '#5C6472',
      text: '#111318',
      primary: '#3046D3',
      onPrimary: '#FFFFFF',
      accent: '#FF5A36',
      onAccent: '#21120E',
      primarySoft: '#E5E9FF',
      primaryBorder: '#AAB5F5',
      sidebar: '#2739AE',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#CAD1FF',
      sidebarBorder: '#4658CB',
      sidebarActive: '#FFFFFF',
      sidebarActiveText: '#2436A7',
      sidebarMarker: '#FF5A36',
    },
  },
  {
    id: 'ink-tomato',
    nameKey: 'themeInkName',
    shortNameKey: 'themeInkShort',
    descriptionKey: 'themeInkDescription',
    fontFamily: 'Commissioner, Arial, sans-serif',
    displayFontFamily: 'Commissioner, Arial, sans-serif',
    swatches: ['#171C24', '#F04A32', '#F4F5F7'],
    tokens: {
      background: '#F4F5F7',
      surface: '#FFFFFF',
      surfaceMuted: '#EAECF0',
      border: '#C8CDD5',
      muted: '#626875',
      text: '#171C24',
      primary: '#171C24',
      onPrimary: '#FFFFFF',
      accent: '#F04A32',
      onAccent: '#24110E',
      primarySoft: '#E8EBEF',
      primaryBorder: '#ADB4BE',
      sidebar: '#171C24',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#ADB5C0',
      sidebarBorder: '#333A46',
      sidebarActive: '#F04A32',
      sidebarActiveText: '#21100D',
      sidebarMarker: '#FFFFFF',
    },
  },
  {
    id: 'ultramarine-sun',
    nameKey: 'themeSunName',
    shortNameKey: 'themeSunShort',
    descriptionKey: 'themeSunDescription',
    fontFamily: 'Golos Text, Arial, sans-serif',
    displayFontFamily: 'Golos Text, Arial, sans-serif',
    swatches: ['#2938C8', '#FFC400', '#EEF0F4'],
    tokens: {
      background: '#EEF0F4',
      surface: '#FFFFFF',
      surfaceMuted: '#E3E6ED',
      border: '#C3C9D5',
      muted: '#5E6572',
      text: '#12151C',
      primary: '#2938C8',
      onPrimary: '#FFFFFF',
      accent: '#FFC400',
      onAccent: '#181507',
      primarySoft: '#E3E6FF',
      primaryBorder: '#ABB3F1',
      sidebar: '#222E9D',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#C8CEFF',
      sidebarBorder: '#4250BA',
      sidebarActive: '#FFC400',
      sidebarActiveText: '#181507',
      sidebarMarker: '#FFFFFF',
    },
  },
  {
    id: 'signal-duo',
    nameKey: 'themeSignalName',
    shortNameKey: 'themeSignalShort',
    descriptionKey: 'themeSignalDescription',
    fontFamily: 'Golos Text, Arial, sans-serif',
    displayFontFamily: 'Golos Text, Arial, sans-serif',
    swatches: ['#2347C5', '#F0442E', '#EEF1F5'],
    tokens: {
      background: '#EEF1F5',
      surface: '#FFFFFF',
      surfaceMuted: '#E2E7EE',
      border: '#C2CAD5',
      muted: '#596373',
      text: '#101318',
      primary: '#2347C5',
      onPrimary: '#FFFFFF',
      accent: '#F0442E',
      onAccent: '#25100C',
      primarySoft: '#E1E8FF',
      primaryBorder: '#A3B3EE',
      sidebar: '#FFFFFF',
      sidebarText: '#101318',
      sidebarMuted: '#657083',
      sidebarBorder: '#C2CAD5',
      sidebarActive: '#2347C5',
      sidebarActiveText: '#FFFFFF',
      sidebarMarker: '#F0442E',
    },
  },
  {
    id: 'bordeaux-ice',
    nameKey: 'themeBordeauxName',
    shortNameKey: 'themeBordeauxShort',
    descriptionKey: 'themeBordeauxDescription',
    fontFamily: 'Commissioner, Arial, sans-serif',
    displayFontFamily: 'Commissioner, Arial, sans-serif',
    swatches: ['#7A2141', '#8ED7E0', '#F1F4F5'],
    tokens: {
      background: '#F1F4F5',
      surface: '#FFFFFF',
      surfaceMuted: '#E5ECEE',
      border: '#C4D0D3',
      muted: '#626B6E',
      text: '#19161A',
      primary: '#7A2141',
      onPrimary: '#FFFFFF',
      accent: '#8ED7E0',
      onAccent: '#102225',
      primarySoft: '#F4E5EB',
      primaryBorder: '#D8A9BA',
      sidebar: '#681B37',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#E6BCCA',
      sidebarBorder: '#8B3D59',
      sidebarActive: '#8ED7E0',
      sidebarActiveText: '#102225',
      sidebarMarker: '#FFFFFF',
    },
  },
  {
    id: 'petrol-apricot',
    nameKey: 'themePetrolName',
    shortNameKey: 'themePetrolShort',
    descriptionKey: 'themePetrolDescription',
    fontFamily: 'Onest, Arial, sans-serif',
    displayFontFamily: 'Onest, Arial, sans-serif',
    swatches: ['#006C72', '#FF7A3D', '#EDF2F2'],
    tokens: {
      background: '#EDF2F2',
      surface: '#FFFFFF',
      surfaceMuted: '#E0E9E9',
      border: '#BDCCCD',
      muted: '#58696A',
      text: '#102022',
      primary: '#006C72',
      onPrimary: '#FFFFFF',
      accent: '#FF7A3D',
      onAccent: '#251208',
      primarySoft: '#DDF1F1',
      primaryBorder: '#8DBFC1',
      sidebar: '#104A4E',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#B8D8D9',
      sidebarBorder: '#32676A',
      sidebarActive: '#FF7A3D',
      sidebarActiveText: '#251208',
      sidebarMarker: '#FFFFFF',
    },
  },
  {
    id: 'aubergine-yellow',
    nameKey: 'themeAubergineName',
    shortNameKey: 'themeAubergineShort',
    descriptionKey: 'themeAubergineDescription',
    fontFamily: 'Golos Text, Arial, sans-serif',
    displayFontFamily: 'Unbounded, Golos Text, sans-serif',
    swatches: ['#4B286D', '#F6C945', '#F0EFF3'],
    tokens: {
      background: '#F0EFF3',
      surface: '#FFFFFF',
      surfaceMuted: '#E6E2EA',
      border: '#C9C2D0',
      muted: '#675E6D',
      text: '#17131B',
      primary: '#4B286D',
      onPrimary: '#FFFFFF',
      accent: '#F6C945',
      onAccent: '#211A05',
      primarySoft: '#EDE3F5',
      primaryBorder: '#BEA2D2',
      sidebar: '#3D2059',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#D5BDE6',
      sidebarBorder: '#624080',
      sidebarActive: '#F6C945',
      sidebarActiveText: '#211A05',
      sidebarMarker: '#FFFFFF',
    },
  },
  {
    id: 'sky-cherry',
    nameKey: 'themeSkyName',
    shortNameKey: 'themeSkyShort',
    descriptionKey: 'themeSkyDescription',
    fontFamily: 'Roboto Flex, Arial, sans-serif',
    displayFontFamily: 'Roboto Flex, Arial, sans-serif',
    swatches: ['#087BBE', '#C82E4D', '#EDF3F6'],
    tokens: {
      background: '#EDF3F6',
      surface: '#FFFFFF',
      surfaceMuted: '#E0EBF0',
      border: '#BED0D9',
      muted: '#596A73',
      text: '#101820',
      primary: '#066DA8',
      onPrimary: '#FFFFFF',
      accent: '#C82E4D',
      onAccent: '#FFFFFF',
      primarySoft: '#DEEFF8',
      primaryBorder: '#8EC4E1',
      sidebar: '#075E8D',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#B9DDF0',
      sidebarBorder: '#2E7BA4',
      sidebarActive: '#FFFFFF',
      sidebarActiveText: '#075E8D',
      sidebarMarker: '#C82E4D',
    },
  },
  {
    id: 'industrial-orange',
    nameKey: 'themeIndustrialName',
    shortNameKey: 'themeIndustrialShort',
    descriptionKey: 'themeIndustrialDescription',
    fontFamily: 'IBM Plex Sans, Arial, sans-serif',
    displayFontFamily: 'IBM Plex Sans, Arial, sans-serif',
    swatches: ['#202832', '#FF4F00', '#E9EDF0'],
    tokens: {
      background: '#E9EDF0',
      surface: '#FFFFFF',
      surfaceMuted: '#DDE3E7',
      border: '#BBC4CB',
      muted: '#5A6670',
      text: '#171A1F',
      primary: '#FF4F00',
      onPrimary: '#171A1F',
      accent: '#202832',
      onAccent: '#FFFFFF',
      primarySoft: '#FFE2D5',
      primaryBorder: '#FFAC86',
      sidebar: '#202832',
      sidebarText: '#FFFFFF',
      sidebarMuted: '#B8C1CA',
      sidebarBorder: '#3F4A55',
      sidebarActive: '#FF4F00',
      sidebarActiveText: '#171A1F',
      sidebarMarker: '#FFFFFF',
    },
  },
]

export function isAppThemeId(value: string | null): value is AppThemeId {
  return appThemes.some((theme) => theme.id === value)
}

export function getAppTheme(id: AppThemeId): AppThemeDefinition {
  return appThemes.find((theme) => theme.id === id) ?? appThemes[0]
}
