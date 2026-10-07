export type ClientProfileTab = 'profile' | 'history'

export interface ClientProfileTabsProps {
  value: ClientProfileTab
  onChange: (value: ClientProfileTab) => void
}
