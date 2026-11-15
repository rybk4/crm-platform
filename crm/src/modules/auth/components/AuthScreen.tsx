import partnersMark from '@/assets/partners-mark.svg'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Surface } from '@/ui/Surface'
import { Heading, Text } from '@/ui/Text'

import { CodeStep } from './CodeStep'
import { PhoneStep } from './PhoneStep'
import type { AuthScreenProps } from './AuthScreen.types'
export type { AuthScreenProps } from './AuthScreen.types'

import './auth.css'
import './auth-buttons.css'
import './auth-code.css'

export function AuthScreen({ auth }: AuthScreenProps) {
  const { t } = useLocale()

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <Surface className="auth-surface">
          <div className="auth-brand">
            <img className="auth-logo" src={partnersMark} width={48} height={48} alt="" />
            <Heading className="auth-brand__name">{t('appName')}</Heading>
          </div>
          <div key={auth.stage} className="auth-step" data-stage={auth.stage}>
            {auth.stage === 'initializing' ? (
              <div className="auth-loading" role="status" aria-live="polite">
                <Text tone="muted">{t('authChecking')}</Text>
              </div>
            ) : (
              <>
                {auth.stage === 'phone' ? (
                  <PhoneStep
                    initialPhone={auth.phone}
                    loading={auth.loading}
                    rejected={auth.rejectedField === 'phone'}
                    onEdit={auth.clearRejection}
                    onSubmit={auth.submitPhone}
                  />
                ) : null}
                {auth.stage === 'code' ? (
                  <CodeStep
                    phone={auth.phone}
                    loading={auth.loading}
                    rejected={auth.rejectedField === 'code'}
                    onEdit={auth.clearRejection}
                    onSubmit={auth.submitCode}
                    onBack={auth.backToPhone}
                  />
                ) : null}
              </>
            )}
          </div>
        </Surface>
      </main>
    </div>
  )
}
