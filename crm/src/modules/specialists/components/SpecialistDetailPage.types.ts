import type { Branch } from '@/modules/organizations/types'
import type { Service } from '@/modules/services/types'
import type { useSpecialists } from '../hooks/useSpecialists'
import type { Specialist } from '../types'

export interface SpecialistProfileContentProps {
  specialist: Specialist
  services: Service[]
  branches: Branch[]
  specialists: ReturnType<typeof useSpecialists>
  onBack: () => void
}
