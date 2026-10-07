import { useLocale } from '@/lib/i18n/LocaleContext'

import { EmptyState } from '@/ui/EmptyState'
import { Loader } from '@/ui/Loader'

import { JournalBoard } from './JournalBoard'
import { JournalList } from './JournalList'
import { JournalWeek } from './JournalWeek'
import type { JournalContentProps } from './JournalContent.types'
export type { JournalContentProps } from './JournalContent.types'

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
  if (view === 'week') {
    return <JournalWeek start={day} appointments={appointments} onOpen={onOpen} />
  }

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
