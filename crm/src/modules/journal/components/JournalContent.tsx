import { useLocale } from '@/lib/i18n/LocaleContext'
import type { Specialist } from '@/modules/specialists/types'
import { EmptyState } from '@/ui/EmptyState'
import { Loader } from '@/ui/Loader'
import type { DayWindow } from '../model'
import type { Appointment } from '../types'
import type { JournalView } from '../hooks/useJournalFilters'
import { JournalBoard } from './JournalBoard'
import { JournalList } from './JournalList'

interface JournalContentProps {
  loading: boolean
  view: JournalView
  columns: readonly Specialist[]
  appointments: readonly Appointment[]
  bounds: DayWindow
  day: Date
  now: Date | null
  onOpen: (appointment: Appointment) => void
  onCreate: (specialistId?: number, startTime?: string) => void
}

/** Состояние раздела: загрузка, пустой день или само расписание. */
export function JournalContent({
  loading,
  view,
  columns,
  appointments,
  bounds,
  day,
  now,
  onOpen,
  onCreate,
}: JournalContentProps) {
  const { t } = useLocale()

  if (loading) return <Loader label={t('loading')} />

  if (!columns.length) {
    return (
      <EmptyState
        icon="specialists"
        title={t('specialistsEmptyTitle')}
        description={t('journalNoSpecialists')}
      />
    )
  }

  if (view === 'list') return <JournalList appointments={appointments} onOpen={onOpen} />

  return (
    <JournalBoard
      specialists={columns}
      appointments={appointments}
      bounds={bounds}
      day={day}
      now={now}
      onOpen={onOpen}
      onCreate={onCreate}
    />
  )
}
