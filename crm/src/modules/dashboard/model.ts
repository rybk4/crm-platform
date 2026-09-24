import { daysBetween, minutesOfDay } from '@/lib/datetime/day'
import type { TranslationKey } from '@/lib/i18n/messages'
import type { Client } from '@/modules/clients/types'
import { availableMinutes, dayWindow } from '@/modules/journal/model'
import type { Appointment } from '@/modules/journal/types'
import type { Specialist } from '@/modules/specialists/types'

const NEW_CLIENT_DAYS = 30
const NEW_CLIENT_WEEK_DAYS = 7

export function greetingKey(hour: number): TranslationKey {
  if (hour < 5) return 'greetingNight'
  if (hour < 12) return 'greetingMorning'
  if (hour < 18) return 'greetingDay'
  return 'greetingEvening'
}

export interface SpecialistDayLoad {
  id: number
  name: string
  bookedMinutes: number
  availableMinutes: number
  percent: number
}

/** Загрузка каждого работающего сегодня мастера — то же, что в аналитике, но за один день. */
export function specialistDayLoad(
  specialists: readonly Specialist[],
  appointments: readonly Appointment[],
  day: Date,
): SpecialistDayLoad[] {
  return specialists
    .filter((specialist) => specialist.is_active && dayWindow(specialist, day))
    .map((specialist) => {
      const booked = appointments
        .filter((item) => item.specialist === specialist.id && item.status !== 'cancelled')
        .reduce((sum, item) => sum + item.duration_minutes, 0)
      const available = availableMinutes([specialist], day)

      return {
        id: specialist.id,
        name: specialist.full_name,
        bookedMinutes: booked,
        availableMinutes: available,
        percent: available > 0 ? Math.round((booked / available) * 100) : 0,
      }
    })
    .sort((left, right) => right.percent - left.percent)
}

/** Записи, до которых день ещё не дошёл: отменённые в план не берём. */
export function upcomingAppointments(
  appointments: readonly Appointment[],
  now: Date,
  limit: number,
) {
  return appointments
    .filter((item) => item.status !== 'cancelled' && new Date(item.ends_at) > now)
    .sort((left, right) => left.starts_at.localeCompare(right.starts_at))
    .slice(0, limit)
}

/**
 * Что команду ждёт дальше: остаток сегодняшнего дня, а если он уже закрыт или
 * почти пуст — начало завтрашнего. Вечером карточка не должна пустовать.
 */
export function nextAppointments(
  today: readonly Appointment[],
  tomorrow: readonly Appointment[],
  now: Date,
  limit: number,
) {
  const rest = upcomingAppointments(today, now, limit)
  if (rest.length >= limit) return rest

  const extra = tomorrow
    .filter((item) => item.status !== 'cancelled')
    .sort((left, right) => left.starts_at.localeCompare(right.starts_at))
    .slice(0, limit - rest.length)

  return [...rest, ...extra]
}

export interface DayProgress {
  completed: number
  remaining: number
  revenue: number
}

export function dayProgress(appointments: readonly Appointment[], now: Date): DayProgress {
  const active = appointments.filter((item) => item.status !== 'cancelled')

  return {
    completed: active.filter((item) => item.status === 'completed').length,
    remaining: active.filter((item) => new Date(item.ends_at) > now).length,
    revenue: active.reduce((sum, item) => sum + Number(item.price), 0),
  }
}

/** Клиенты, чей первый визит попал в последние `days` дней. */
export function newClients(clients: readonly Client[], now: Date, days = NEW_CLIENT_DAYS) {
  return clients
    .filter((client) => {
      if (!client.first_visit_at) return false
      const since = daysBetween(new Date(client.first_visit_at), now)
      return since >= 0 && since <= days
    })
    .sort((left, right) => (right.first_visit_at ?? '').localeCompare(left.first_visit_at ?? ''))
}

export function newClientsThisWeek(clients: readonly Client[], now: Date) {
  return newClients(clients, now, NEW_CLIENT_WEEK_DAYS).length
}

/** Доля прошедшего рабочего времени — для полосы прогресса дня. */
export function dayElapsedPercent(specialists: readonly Specialist[], day: Date, now: Date) {
  const windows = specialists
    .map((specialist) => dayWindow(specialist, day))
    .filter((window) => window !== null)

  if (!windows.length) return 0

  const open = Math.min(...windows.map((window) => window.open))
  const close = Math.max(...windows.map((window) => window.close))
  const current = minutesOfDay(now)

  if (current <= open) return 0
  if (current >= close) return 100

  return Math.round(((current - open) / (close - open)) * 100)
}
