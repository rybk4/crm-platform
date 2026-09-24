import type { ReactNode } from 'react'

import { Surface } from './Surface'
import './card.css'

interface CardProps {
  children: ReactNode
  title?: string
  hint?: string
  actions?: ReactNode
  className?: string
}

export function Card({ children, title, hint, actions, className }: CardProps) {
  return (
    <Surface className={className ? `ui-card ${className}` : 'ui-card'}>
      {title ? (
        <div className="ui-card__header">
          <div className="ui-card__copy">
            <h2>{title}</h2>
            {hint ? <p>{hint}</p> : null}
          </div>
          {actions ? <div className="ui-card__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="ui-card__body">{children}</div>
    </Surface>
  )
}
