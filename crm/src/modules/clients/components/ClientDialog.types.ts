import type { useClientDialog } from '../hooks/useClientDialog'

export interface ClientDialogProps {
  dialog: ReturnType<typeof useClientDialog>
  saving: boolean
}
