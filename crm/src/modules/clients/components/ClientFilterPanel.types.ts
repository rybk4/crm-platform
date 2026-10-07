import type { Service } from '@/modules/services/types'
import type { useClientFilters } from '../hooks/useClientFilters'

export interface ClientFilterPanelProps {
  filters: ReturnType<typeof useClientFilters>
  services: readonly Service[]
}
