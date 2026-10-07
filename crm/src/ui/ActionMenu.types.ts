import type { IconName } from './Icon'

export interface ActionMenuItem {
  key: string
  label: string
  icon: IconName
  danger?: boolean
  onSelect: () => void
}

export interface ActionMenuProps {
  label: string
  items: readonly ActionMenuItem[]
}
