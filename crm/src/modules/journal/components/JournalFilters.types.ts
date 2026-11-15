import type { Service } from '@/modules/services/types'
import type { Specialist } from '@/modules/specialists/types'
import type { JournalSettings } from '../filterModel'
export interface JournalFiltersProps {
  settings: JournalSettings
  services: readonly Service[]
  specialists: readonly Specialist[]
  onApply: (settings: JournalSettings) => void
  onClose: () => void
}
