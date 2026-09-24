import { useMemo } from 'react'

import { addDays, dayKey } from '@/lib/datetime/day'
import { useAnalytics } from '@/modules/analytics/hooks/useAnalytics'
import { useClients } from '@/modules/clients/hooks/useClients'
import { useAppointments } from '@/modules/journal/hooks/useAppointments'
import { useSpecialists } from '@/modules/specialists/hooks/useSpecialists'
import type { ActiveBranchDetails } from '@/modules/auth/types'
import {
  dayElapsedPercent,
  dayProgress,
  newClients,
  newClientsThisWeek,
  nextAppointments,
  specialistDayLoad,
} from '../model'

const UPCOMING_LIMIT = 6
const NEW_CLIENTS_LIMIT = 5

interface UseDashboardOptions {
  activeBranch: ActiveBranchDetails | null
  now: Date
}

/** Обзор собирается из данных других разделов — своего эндпоинта у него нет. */
export function useDashboard({ activeBranch, now }: UseDashboardOptions) {
  const today = useMemo(() => dayKey(now), [now])
  const tomorrow = useMemo(() => dayKey(addDays(now, 1)), [now])
  const journal = useAppointments({ date: today, specialist: null, status: null })
  // Когда день закрыт, показывать пустой список бессмысленно — берём завтрашний.
  const nextDay = useAppointments({ date: tomorrow, specialist: null, status: null })
  const { specialists } = useSpecialists()
  const { clients } = useClients()
  const analytics = useAnalytics(7)

  const onDuty = useMemo(
    () =>
      specialists.filter(
        (item) => item.is_active && (!activeBranch || item.branch === activeBranch.id),
      ),
    [specialists, activeBranch],
  )

  const onDutyIds = useMemo(() => new Set(onDuty.map((person) => person.id)), [onDuty])

  const appointments = useMemo(
    () => journal.appointments.filter((item) => onDutyIds.has(item.specialist)),
    [journal.appointments, onDutyIds],
  )

  const tomorrowAppointments = useMemo(
    () => nextDay.appointments.filter((item) => onDutyIds.has(item.specialist)),
    [nextDay.appointments, onDutyIds],
  )

  return {
    isLoading: journal.isLoading || analytics.isLoading,
    appointments,
    upcoming: nextAppointments(appointments, tomorrowAppointments, now, UPCOMING_LIMIT),
    progress: dayProgress(appointments, now),
    elapsedPercent: dayElapsedPercent(onDuty, now, now),
    load: specialistDayLoad(onDuty, appointments, now),
    newClients: newClients(clients, now).slice(0, NEW_CLIENTS_LIMIT),
    newClientsThisWeek: newClientsThisWeek(clients, now),
    summary: analytics.summary,
    currency: analytics.summary?.currency ?? clients[0]?.currency ?? '',
  }
}
