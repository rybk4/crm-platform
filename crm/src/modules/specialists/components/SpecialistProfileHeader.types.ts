import type { Specialist } from '../types'

export interface SpecialistProfileHeaderProps {
  specialist: Specialist
  onBack: () => void
  onEdit: () => void
}
