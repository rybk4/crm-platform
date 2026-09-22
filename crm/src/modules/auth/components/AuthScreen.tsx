import { useLocale } from '@/lib/i18n/LocaleContext'
import { Surface } from '@/ui/Surface'
import { Text } from '@/ui/Text'
import type { AuthFlow } from '../hooks/useAuthFlow'
import { CodeStep } from './CodeStep'
import { PhoneStep } from './PhoneStep'
import './auth.css'

interface AuthScreenProps {
  auth: AuthFlow
}

export function AuthScreen({ auth }: AuthScreenProps) {
  const { t } = useLocale()

  return (
    <div className="auth-shell">
      <header className="auth-brand">
        <div className="brand-mark" aria-hidden="true">
          C
        </div>
        <span>{t('appName')}</span>
      </header>

      <main className="auth-main">
        <Surface className="auth-surface">
          {auth.stage === 'initializing' ? (
            <div className="auth-loading" role="status" aria-live="polite">
              <Text tone="muted">{t('authChecking')}</Text>
            </div>
          ) : null}

          {auth.stage === 'phone' ? (
            <PhoneStep
              initialPhone={auth.phone}
              loading={auth.loading}
              onSubmit={auth.submitPhone}
            />
          ) : null}

          {auth.stage === 'code' ? (
            <CodeStep
              phone={auth.phone}
              debugHint={auth.debugHint}
              loading={auth.loading}
              onSubmit={auth.submitCode}
              onBack={auth.backToPhone}
            />
          ) : null}
        </Surface>
      </main>

      <footer className="auth-footer">{t('authFooter')}</footer>
    </div>
  )
}
