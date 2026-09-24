import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

import { App } from '@/app/App'
import { AppErrorBoundary } from '@/app/AppErrorBoundary'
import { installMockApi } from '@/mocks/installMockApi'
import './index.css'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { UiProvider } from '@/ui/UiProvider'
import { ToastProvider } from '@/ui/ToastProvider'
import { ServerStatusBanner } from '@/modules/shell/components/ServerStatusBanner'

// Демо-данные: временный слой на время, пока части API ещё нет.
// Как отключить и как удалить целиком — src/mocks/README.md.
if (import.meta.env.VITE_DEMO_DATA !== 'off') installMockApi()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocaleProvider>
          <UiProvider>
            <ServerStatusBanner />
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
            <ToastProvider />
          </UiProvider>
        </LocaleProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
