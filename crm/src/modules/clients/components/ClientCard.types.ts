import type { Client } from '../types'

export interface ClientCardProps {
  client: Client
  onOpen: (client: Client) => void
  onDelete: (client: Client) => void
}
