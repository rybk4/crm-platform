import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/onest/cyrillic-400.css'
import '@fontsource/onest/cyrillic-500.css'
import '@fontsource/onest/cyrillic-600.css'
import '@fontsource/onest/cyrillic-700.css'
import '@fontsource/commissioner/cyrillic-400.css'
import '@fontsource/commissioner/cyrillic-500.css'
import '@fontsource/commissioner/cyrillic-600.css'
import '@fontsource/commissioner/cyrillic-700.css'
import '@fontsource/golos-text/cyrillic-400.css'
import '@fontsource/golos-text/cyrillic-500.css'
import '@fontsource/golos-text/cyrillic-600.css'
import '@fontsource/golos-text/cyrillic-700.css'
import '@fontsource/ibm-plex-sans/cyrillic-400.css'
import '@fontsource/ibm-plex-sans/cyrillic-500.css'
import '@fontsource/ibm-plex-sans/cyrillic-600.css'
import '@fontsource/ibm-plex-sans/cyrillic-700.css'
import '@fontsource/ibm-plex-mono/cyrillic-500.css'
import '@fontsource/roboto-flex/cyrillic.css'
import '@fontsource/unbounded/cyrillic-600.css'

import { App } from './app/App'
import './index.css'
import { LocaleProvider } from './lib/i18n/LocaleProvider'
import { UiProvider } from './ui/UiProvider'
import { ToastProvider } from './ui/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <UiProvider>
          <App />
          <ToastProvider />
        </UiProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)
