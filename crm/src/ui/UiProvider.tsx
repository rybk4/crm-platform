import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import { appTheme } from './theme/appTheme'
import type { AppThemeDefinition } from './theme/types'
import type { ThemeVariables, UiProviderProps } from './UiProvider.types'
export type { ThemeVariables, UiProviderProps } from './UiProvider.types'

function createMuiTheme(theme: AppThemeDefinition) {
  return createTheme({
    palette: {
      primary: {
        main: theme.tokens.primary,
        contrastText: theme.tokens.onPrimary,
      },
      secondary: {
        main: theme.tokens.accent,
        contrastText: theme.tokens.onAccent,
      },
      background: {
        default: theme.tokens.background,
        paper: theme.tokens.surface,
      },
      text: {
        primary: theme.tokens.text,
        secondary: theme.tokens.muted,
      },
      divider: theme.tokens.border,
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: theme.fontFamily,
      h5: {
        fontFamily: theme.displayFontFamily,
        fontSize: '1.75rem',
        fontWeight: 650,
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h6: {
        fontFamily: theme.displayFontFamily,
        fontSize: '1.125rem',
        fontWeight: 650,
        lineHeight: 1.35,
      },
      body1: {
        fontSize: '0.9375rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 650,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 8,
            boxShadow: 'none',
            fontWeight: 650,
            textTransform: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}

const muiTheme = createMuiTheme(appTheme)

const themeVariables: ThemeVariables = {
  '--app-font-family': appTheme.fontFamily,
  '--app-display-font-family': appTheme.displayFontFamily,
  '--app-background': appTheme.tokens.background,
  '--app-surface': appTheme.tokens.surface,
  '--app-surface-muted': appTheme.tokens.surfaceMuted,
  '--app-border': appTheme.tokens.border,
  '--app-muted': appTheme.tokens.muted,
  '--app-text': appTheme.tokens.text,
  '--app-primary': appTheme.tokens.primary,
  '--app-on-primary': appTheme.tokens.onPrimary,
  '--app-accent': appTheme.tokens.accent,
  '--app-on-accent': appTheme.tokens.onAccent,
  '--app-primary-soft': appTheme.tokens.primarySoft,
  '--app-primary-border': appTheme.tokens.primaryBorder,
  '--app-sidebar': appTheme.tokens.sidebar,
  '--app-sidebar-text': appTheme.tokens.sidebarText,
  '--app-sidebar-muted': appTheme.tokens.sidebarMuted,
  '--app-sidebar-border': appTheme.tokens.sidebarBorder,
  '--app-sidebar-active': appTheme.tokens.sidebarActive,
  '--app-sidebar-active-text': appTheme.tokens.sidebarActiveText,
  '--app-sidebar-marker': appTheme.tokens.sidebarMarker,
}

export function UiProvider({ children }: UiProviderProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div className="app-theme-root" style={themeVariables}>
        {children}
      </div>
    </ThemeProvider>
  )
}
