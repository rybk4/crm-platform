import type { Service } from '../types'

export interface ServiceRowProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}
