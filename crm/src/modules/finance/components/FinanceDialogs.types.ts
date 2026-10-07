import type { useFinanceDialog } from '../hooks/useFinanceDialog'

export interface FinanceDialogsProps {
  dialog: ReturnType<typeof useFinanceDialog>
  saving: boolean
}
