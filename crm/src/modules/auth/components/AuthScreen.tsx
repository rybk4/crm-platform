import partnersMark from '@/assets/partners-mark.svg'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Surface } from '@/ui/Surface'
import { Heading, Text } from '@/ui/Text'

import { CodeStep } from './CodeStep'
import { PhoneStep } from './PhoneStep'
import type { AuthScreenProps } from './AuthScreen.types'
export type { AuthScreenProps } from './AuthScreen.types'

import './auth.css'

export function AuthScreen({ auth }: AuthScreenProps) {
  const { t } = useLocale()

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <Surface className="auth-surface">
          <img className="auth-logo" src={partnersMark} alt="" />
          <Heading className="auth-title">{t('authTitle')}</Heading>

          {auth.stage === 'initializing' ? (
            <div className="auth-loading" role="status" aria-live="polite">
              <Text tone="muted">{t('authChecking')}</Text>
            </div>
          ) : null}

          {auth.stage === 'phone' ? (
            <PhoneStep
              initialPhone={auth.phone}
              loading={auth.loading}
              errorMessage={auth.error}
              onSubmit={auth.submitPhone}
            />
          ) : null}

          {auth.stage === 'code' ? (
            <CodeStep
              phone={auth.phone}
              debugHint={auth.debugHint}
              loading={auth.loading}
              errorMessage={auth.error}
              onSubmit={auth.submitCode}
              onBack={auth.backToPhone}
            />
          ) : null}
        </Surface>
      </main>
    </div>
  )
}
