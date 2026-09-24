import type { IconName } from './Icon'
import { Icon } from './Icon'
import './status-pill.css'

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

interface StatusPillProps {
  label: string
  tone?: StatusTone
  icon?: IconName
  size?: 'sm' | 'md'
}

export function StatusPill({ label, tone = 'neutral', icon, size = 'md' }: StatusPillProps) {
  return (
    <span className="ui-status-pill" data-tone={tone} data-size={size}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} /> : null}
      {label}
    </span>
  )
}
