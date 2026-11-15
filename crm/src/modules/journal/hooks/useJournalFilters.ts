import { useCallback, useMemo, useState } from 'react'

import { dayKey, shiftDayKey } from '@/lib/datetime/day'
import type { EntityId } from '@/lib/api/entityId'
import type { AppointmentStatus } from '../types'
import { journalWeek } from '../calendarModel'
import type { JournalDateRange } from '../calendarModel'
import { initialJournalSettings } from '../filterModel'

export type JournalView = 'board' | 'week' | 'list'

/** Выбор дня, фильтры и режим показа журнала — это состояние экрана, не сервера. */
export function useJournalFilters(today = new Date()) {
  const todayKey = useMemo(() => dayKey(today), [today])
  const [date, setDateValue] = useState(todayKey)
  const [range, setRange] = useState<JournalDateRange | null>(null)
  const setDate = useCallback((value: string) => {
    setDateValue(value)
    setRange(null)
  }, [])
  const selectRange = useCallback((value: JournalDateRange) => {
    setRange(value)
    setDateValue(value.from)
  }, [])
  const [specialist, setSpecialist] = useState<EntityId | null>(null)
  const [status, setStatus] = useState<AppointmentStatus | null>(null)
  const [view, setView] = useState<JournalView>('board')
  const [settings, setSettings] = useState(initialJournalSettings)
  const selectSpecialist = useCallback((id: EntityId | null) => {
    setSpecialist(id)
    setRange(null)
    setView(id === null ? 'board' : 'week')
  }, [])

  const goToToday = useCallback(() => {
    setDateValue(todayKey)
    setRange(specialist === null ? null : journalWeek(todayKey))
  }, [todayKey, specialist])
  const shift = useCallback((days: number) => {
    setDateValue((current) => shiftDayKey(current, days))
    setRange(null)
  }, [])

  return {
    date,
    range,
    selectRange,
    isToday: date === todayKey,
    specialist,
    status,
    view,
    setDate,
    setSpecialist: selectSpecialist,
    settings,
    setSettings,
    setStatus,
    setView,
    goToToday,
    shift,
  }
}
