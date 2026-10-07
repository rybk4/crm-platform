import type { WorkSchedule } from '../types'

export interface ScheduleEditorProps {
  schedule: WorkSchedule[]
  onChange: (weekday: number, changes: Partial<WorkSchedule>) => void
}
