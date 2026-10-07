import { Icon } from './Icon'
import type { StatusPillProps } from './StatusPill.types'
export type { StatusTone, StatusPillProps } from './StatusPill.types'

import './status-pill.css'

export function StatusPill({ label, tone = 'neutral', icon, size = 'md' }: StatusPillProps) {
  return (
    <span className="ui-status-pill" data-tone={tone} data-size={size}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} /> : null}
      {label}
    </span>
  )
}
