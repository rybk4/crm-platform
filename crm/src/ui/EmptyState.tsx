import { Icon } from './Icon'
import { Surface } from './Surface'
import type { EmptyStateProps } from './EmptyState.types'
export type { EmptyStateProps } from './EmptyState.types'

import './empty-state.css'

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Surface className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </Surface>
  )
}
