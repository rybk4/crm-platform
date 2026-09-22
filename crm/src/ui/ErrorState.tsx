import type { IconName } from './Icon'
import { Icon } from './Icon'
import { Button } from './Button'
import { Surface } from './Surface'
import { Heading, Text } from './Text'
import './error-state.css'

interface ErrorStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  icon?: IconName
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  details?: string
}

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'alert',
  secondaryActionLabel,
  onSecondaryAction,
  details,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <Surface className="error-state__card">
        <div className="error-state__icon" aria-hidden="true">
          <Icon name={icon} size={28} />
        </div>

        <div className="error-state__copy">
          <Heading level={2}>{title}</Heading>
          <Text tone="muted">{description}</Text>
        </div>

        {details ? <pre className="error-state__details">{details}</pre> : null}

        <div className="error-state__actions">
          <Button onClick={onAction}>{actionLabel}</Button>
          {secondaryActionLabel && onSecondaryAction ? (
            <Button kind="quiet" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      </Surface>
    </div>
  )
}
