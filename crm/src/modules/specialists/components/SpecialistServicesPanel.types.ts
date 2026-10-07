import type { EntityId } from '@/lib/api/entityId'
import type { Service } from '@/modules/services/types'

export interface SpecialistServicesPanelProps {
  services: Service[]
  selectedIds: EntityId[]
  onToggle: (serviceId: EntityId, selected: boolean) => void
  onSave: () => void
}
