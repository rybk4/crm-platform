import { useEffect } from 'react'

import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Locale } from '@/lib/i18n/locale'
import { AuthScreen } from '@/modules/auth/components/AuthScreen'
import { useAuthFlow } from '@/modules/auth/hooks/useAuthFlow'
import { AppShell } from '@/modules/shell/components/AppShell'

export function App() {
  const auth = useAuthFlow()
  const { locale, setLocale } = useLocale()

  useEffect(() => {
    if (auth.user?.locale) setLocale(auth.user.locale)
  }, [auth.user?.locale, setLocale])

  async function handleLocaleChange(nextLocale: Locale) {
    const previousLocale = locale
    setLocale(nextLocale)
    try {
      await auth.updateLocale(nextLocale)
    } catch (error) {
      setLocale(previousLocale)
      throw error
    }
  }

  if (auth.stage === 'authenticated' && auth.user) {
    return (
      <AppShell
        user={auth.user}
        onActiveBranchChange={auth.updateActiveBranch}
        onLocaleChange={handleLocaleChange}
        onLogout={auth.logout}
      />
    )
  }

  return <AuthScreen auth={auth} />
}
