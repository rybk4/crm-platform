import type { useClients } from '../hooks/useClients'
import type { Client } from '../types'

export interface ClientProfilePanelProps {
  client: Client
  clients: ReturnType<typeof useClients>
  onCancel: () => void
}
