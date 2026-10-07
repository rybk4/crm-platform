import type { SpecialistProfileTab } from '../hooks/useSpecialistProfile'

export interface SpecialistProfileTabsProps {
  value: SpecialistProfileTab
  onChange: (value: SpecialistProfileTab) => void
}
