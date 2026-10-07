import type { WorkSchedule } from '../types'

export interface SpecialistSchedulePanelProps {
  schedule: WorkSchedule[]
  onChange: (weekday: number, changes: Partial<WorkSchedule>) => void
  onSave: () => void
}
