import type { Client } from '@/modules/clients/types'
import type { useCampaignDialog } from '../hooks/useCampaignDialog'

export interface CampaignDialogProps {
  dialog: ReturnType<typeof useCampaignDialog>
  clients: readonly Client[]
  saving: boolean
}
