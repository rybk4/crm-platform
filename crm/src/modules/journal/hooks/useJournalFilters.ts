import { useCallback, useMemo, useState } from 'react'

import { dayKey, shiftDayKey } from '@/lib/datetime/day'
import type { AppointmentStatus } from '../types'

export type JournalView = 'board' | 'list'

/** Выбор дня, фильтры и режим показа журнала — это состояние экрана, не сервера. */
export function useJournalFilters(today = new Date()) {
  const todayKey = useMemo(() => dayKey(today), [today])
  const [date, setDate] = useState(todayKey)
  const [specialist, setSpecialist] = useState<number | null>(null)
  const [status, setStatus] = useState<AppointmentStatus | null>(null)
  const [view, setView] = useState<JournalView>('board')

  const goToToday = useCallback(() => setDate(todayKey), [todayKey])
  const shift = useCallback((days: number) => setDate((current) => shiftDayKey(current, days)), [])

  return {
    date,
    isToday: date === todayKey,
    specialist,
    status,
    view,
    setDate,
    setSpecialist,
    setStatus,
    setView,
    goToToday,
    shift,
  }
}
