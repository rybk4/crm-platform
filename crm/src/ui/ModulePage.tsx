import type { IconName } from './Icon'
import { Icon } from './Icon'
import { Surface } from './Surface'
import { Heading, Text } from './Text'
import './module-page.css'

interface ModulePageProps {
  description: string
  emptyDescription: string
  emptyTitle: string
  icon: IconName
  title: string
}

export function ModulePage({
  description,
  emptyDescription,
  emptyTitle,
  icon,
  title,
}: ModulePageProps) {
  return (
    <div className="module-page">
      <header className="module-page__header">
        <Heading>{title}</Heading>
        <Text tone="muted">{description}</Text>
      </header>

      <Surface className="module-empty-state">
        <div className="module-empty-state__icon">
          <Icon name={icon} size={24} />
        </div>
        <div className="module-empty-state__copy">
          <Heading level={2}>{emptyTitle}</Heading>
          <Text tone="muted">{emptyDescription}</Text>
        </div>
      </Surface>
    </div>
  )
}
