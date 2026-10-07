import type { ActiveBranchDetails } from '@/modules/auth/types'

export interface DashboardHeroProps {
  name: string
  now: Date
  activeBranch: ActiveBranchDetails | null
  elapsedPercent: number
}
