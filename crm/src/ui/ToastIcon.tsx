import { Icon } from './Icon'
import type { ToastIconProps } from './ToastIcon.types'

export function ToastIcon({ type }: ToastIconProps) {
  return (
    <span className="ui-toast-icon" data-tone={type}>
      <Icon
        name={
          type === 'success' ? 'check' : type === 'error' || type === 'warning' ? 'alert' : 'note'
        }
        size={18}
      />
    </span>
  )
}
