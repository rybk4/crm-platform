import { useLocation } from 'react-router-dom'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { ErrorBoundary } from '@/ui/ErrorBoundary'
import { ErrorState } from '@/ui/ErrorState'
import type { AppErrorBoundaryProps } from './AppErrorBoundary.types'
export type { AppErrorBoundaryProps } from './AppErrorBoundary.types'

/**
 * Ловит ошибки рендера всего приложения и показывает карточку вместо белого
 * экрана. Сбрасывается при смене маршрута, чтобы уход в другой раздел лечил
 * сбой без перезагрузки.
 */
export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const { t } = useLocale()
  const location = useLocation()

  return (
    <ErrorBoundary
      resetKey={location.pathname}
      renderFallback={(error, retry) => (
        <ErrorState
          title={t('errorBoundaryTitle')}
          description={t('errorBoundaryDescription')}
          actionLabel={t('errorBoundaryRetry')}
          onAction={retry}
          secondaryActionLabel={t('errorBoundaryReload')}
          onSecondaryAction={() => window.location.reload()}
          details={import.meta.env.DEV ? error.message : undefined}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
