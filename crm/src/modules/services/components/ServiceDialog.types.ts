import type { Specialist } from '@/modules/specialists/types'
import type { useServiceDialog } from '../hooks/useServiceDialog'

export interface ServiceDialogProps {
  dialog: ReturnType<typeof useServiceDialog>
  specialists: Specialist[]
  saving: boolean
}
