import type { JournalBoardProps } from './JournalBoard.types'
import type { Specialist } from '@/modules/specialists/types'
export interface JournalWeekProps extends Pick<
  JournalBoardProps,
  'appointments' | 'bounds' | 'step' | 'onOpen' | 'onCreate'
> {
  start: Date
  end?: string
  specialist: Specialist
}
