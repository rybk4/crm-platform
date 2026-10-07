import type { Branch } from '@/modules/organizations/types'
import type { useSpecialistDialog } from '../hooks/useSpecialistDialog'

export interface SpecialistDialogProps {
  dialog: ReturnType<typeof useSpecialistDialog>
  branches: Branch[]
  saving: boolean
}
