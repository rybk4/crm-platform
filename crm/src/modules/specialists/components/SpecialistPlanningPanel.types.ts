import type { SpecialistProfileTab } from '../hooks/useSpecialistProfile'

export interface SpecialistPlanningPanelProps {
  tab: Extract<SpecialistProfileTab, 'vacations' | 'payouts'>
  vacationStart: string
  vacationEnd: string
  payoutModel: 'percent' | 'fixed' | 'salary'
  payoutValue: string
  onVacationStartChange: (value: string) => void
  onVacationEndChange: (value: string) => void
  onPayoutModelChange: (value: 'percent' | 'fixed' | 'salary') => void
  onPayoutValueChange: (value: string) => void
  onSave: () => void
}
