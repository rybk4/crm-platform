import type { Specialist } from '../types'

export interface SpecialistCardProps {
  specialist: Specialist
  onOpen: (specialist: Specialist) => void
  onEdit: (specialist: Specialist) => void
  onDelete: (specialist: Specialist) => void
}
