import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { AppThemeContext } from './theme/AppThemeContext'
import {
  appThemes,
  DEFAULT_THEME_ID,
  getAppTheme,
  isAppThemeId,
  type AppThemeDefinition,
  type AppThemeId,
} from './theme/themes'

const THEME_STORAGE_KEY = 'crm-design-theme'

type ThemeVariables = CSSProperties & Record<`--${string}`, string>

function readStoredTheme(): AppThemeId {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isAppThemeId(storedTheme) ? storedTheme : DEFAULT_THEME_ID
}

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

interface UiProviderProps {
  children: ReactNode
}

export function UiProvider({ children }: UiProviderProps) {
  const [themeId, setThemeId] = useState<AppThemeId>(readStoredTheme)
  const activeTheme = getAppTheme(themeId)
  const muiTheme = useMemo(() => createMuiTheme(activeTheme), [activeTheme])
  const contextValue = useMemo(
    () => ({ activeTheme, themes: appThemes, selectTheme: setThemeId }),
    [activeTheme],
  )
  const themeVariables = useMemo<ThemeVariables>(
    () => ({
      '--app-font-family': activeTheme.fontFamily,
      '--app-display-font-family': activeTheme.displayFontFamily,
      '--app-background': activeTheme.tokens.background,
      '--app-surface': activeTheme.tokens.surface,
      '--app-surface-muted': activeTheme.tokens.surfaceMuted,
      '--app-border': activeTheme.tokens.border,
      '--app-muted': activeTheme.tokens.muted,
      '--app-text': activeTheme.tokens.text,
      '--app-primary': activeTheme.tokens.primary,
      '--app-on-primary': activeTheme.tokens.onPrimary,
      '--app-accent': activeTheme.tokens.accent,
      '--app-on-accent': activeTheme.tokens.onAccent,
      '--app-primary-soft': activeTheme.tokens.primarySoft,
      '--app-primary-border': activeTheme.tokens.primaryBorder,
      '--app-sidebar': activeTheme.tokens.sidebar,
      '--app-sidebar-text': activeTheme.tokens.sidebarText,
      '--app-sidebar-muted': activeTheme.tokens.sidebarMuted,
      '--app-sidebar-border': activeTheme.tokens.sidebarBorder,
      '--app-sidebar-active': activeTheme.tokens.sidebarActive,
      '--app-sidebar-active-text': activeTheme.tokens.sidebarActiveText,
      '--app-sidebar-marker': activeTheme.tokens.sidebarMarker,
    }),
    [activeTheme],
  )

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId)
    document.documentElement.dataset.theme = themeId
  }, [themeId])

  return (
    <AppThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div className="app-theme-root" style={themeVariables}>
          {children}
        </div>
      </ThemeProvider>
    </AppThemeContext.Provider>
  )
}
