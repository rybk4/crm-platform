export interface AppThemeDefinition {
  fontFamily: string
  displayFontFamily: string
  referenceFontFamily: string
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
