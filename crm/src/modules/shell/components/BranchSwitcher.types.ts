import type { EntityId } from '@/lib/api/entityId'
import type { Branch } from '@/modules/organizations/types'

export interface BranchSwitcherProps {
  branches: Branch[]
  activeBranchId: EntityId | null
  loading: boolean
  disabled: boolean
  onSelect: (branchId: EntityId) => void
}
