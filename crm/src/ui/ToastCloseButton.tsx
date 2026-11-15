import { useLocale } from '@/lib/i18n/LocaleContext'
import { Icon } from './Icon'
import type { ToastCloseButtonProps } from './ToastCloseButton.types'

export function ToastCloseButton({ onClose }: ToastCloseButtonProps) {
  const { t } = useLocale()

  return (
    <button
      className="ui-toast-close"
      type="button"
      aria-label={t('dismissNotification')}
      onClick={onClose}
    >
      <Icon name="close" size={16} />
    </button>
  )
}
