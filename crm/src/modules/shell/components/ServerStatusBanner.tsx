import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { useServerStatus } from '../hooks/useServerStatus'
import './server-status-banner.css'

export function ServerStatusBanner() {
  const { t } = useLocale()
  const { unavailable, checking, retry } = useServerStatus()

  if (!unavailable) return null

  return (
    <div className="server-status-banner" role="status" aria-live="polite">
      <span className="server-status-banner__icon" aria-hidden="true">
        <Icon name="offline" size={18} />
      </span>

      <div className="server-status-banner__copy">
        <strong>{t('serverUnavailableTitle')}</strong>
        <span>{checking ? t('serverUnavailableChecking') : t('serverUnavailableDescription')}</span>
      </div>

      <Button
        kind="outline"
        loading={checking}
        startIcon={<Icon name="refresh" size={16} />}
        onClick={retry}
      >
        {t('serverUnavailableRetry')}
      </Button>
    </div>
  )
}
