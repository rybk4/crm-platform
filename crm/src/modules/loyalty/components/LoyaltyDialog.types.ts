import type { useLoyaltyDialog } from '../hooks/useLoyaltyDialog'

export interface LoyaltyDialogProps {
  dialog: ReturnType<typeof useLoyaltyDialog>
  saving: boolean
}
