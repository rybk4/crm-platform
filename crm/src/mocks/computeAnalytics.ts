import type {
  AnalyticsMetric,
  AnalyticsSummary,
  SpecialistLoadItem,
  TopServiceItem,
} from '@/modules/analytics/types'
import { appointmentStatuses, type Appointment } from '@/modules/journal/types'
import type { Specialist } from '@/modules/specialists/types'
import { addDays, dayKey, minutesFromTime, startOfDay, weekdayIndex } from '@/lib/datetime/day'
import { db } from './db'

const TOP_SERVICES_LIMIT = 6

interface Window {
  from: Date
  to: Date
}

function inWindow(appointment: Appointment, window: Window) {
  const date = new Date(appointment.starts_at)
  return date >= window.from && date < window.to
}

function revenueOf(appointments: readonly Appointment[]) {
  return appointments
    .filter((appointment) => appointment.status === 'completed')
    .reduce((sum, appointment) => sum + Number(appointment.price), 0)
}

function metric(value: number, previous: number): AnalyticsMetric {
  return { value: Math.round(value), previous: Math.round(previous) }
}

/** Рабочие минуты специалиста за период — знаменатель загрузки. */
function availableMinutes(specialist: Specialist, window: Window) {
  let total = 0

  for (let day = startOfDay(window.from); day < window.to; day = addDays(day, 1)) {
    const schedule = specialist.schedule.find((item) => item.weekday === weekdayIndex(day))
    if (!schedule || schedule.is_day_off || !schedule.start_time || !schedule.end_time) continue

    const span = minutesFromTime(schedule.end_time) - minutesFromTime(schedule.start_time)
    const pause =
      schedule.break_start && schedule.break_end
        ? minutesFromTime(schedule.break_end) - minutesFromTime(schedule.break_start)
        : 0

    total += Math.max(span - pause, 0)
  }

  return total
}

function bookedMinutes(appointments: readonly Appointment[]) {
  return appointments
    .filter((appointment) => appointment.status !== 'cancelled')
    .reduce((sum, appointment) => sum + appointment.duration_minutes, 0)
}

function loadPercent(booked: number, available: number) {
  return available > 0 ? Math.round((booked / available) * 100) : 0
}

function specialistLoad(appointments: Appointment[], window: Window): SpecialistLoadItem[] {
  return db.specialists
    .filter((specialist) => specialist.is_active)
    .map((specialist) => {
      const own = appointments.filter((item) => item.specialist === specialist.id)
      const booked = bookedMinutes(own)
      const available = availableMinutes(specialist, window)

      return {
        specialist_id: specialist.id,
        specialist_name: specialist.full_name,
        booked_minutes: booked,
        available_minutes: available,
        load_percent: loadPercent(booked, available),
        revenue: String(revenueOf(own)),
      }
    })
    .sort((left, right) => right.load_percent - left.load_percent)
}

function topServices(appointments: Appointment[]): TopServiceItem[] {
  const totals = new Map<number, TopServiceItem>()

  for (const appointment of appointments) {
    if (appointment.status !== 'completed') continue

    const current = totals.get(appointment.service) ?? {
      service_id: appointment.service,
      service_name: appointment.service_name,
      appointments_count: 0,
      revenue: '0',
    }

    totals.set(appointment.service, {
      ...current,
      appointments_count: current.appointments_count + 1,
      revenue: String(Number(current.revenue) + Number(appointment.price)),
    })
  }

  return [...totals.values()]
    .sort((left, right) => Number(right.revenue) - Number(left.revenue))
    .slice(0, TOP_SERVICES_LIMIT)
}

function revenueByDay(appointments: Appointment[], window: Window) {
  const totals = new Map<string, number>()

  for (let day = startOfDay(window.from); day < window.to; day = addDays(day, 1)) {
    totals.set(dayKey(day), 0)
  }

  for (const appointment of appointments) {
    if (appointment.status !== 'completed') continue

    const key = dayKey(new Date(appointment.starts_at))
    if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + Number(appointment.price))
  }

  return [...totals.entries()].map(([date, value]) => ({ date, value }))
}

function newClients(appointments: Appointment[], window: Window) {
  const firstVisit = new Map<number, Date>()

  for (const appointment of db.appointments) {
    const date = new Date(appointment.starts_at)
    const current = firstVisit.get(appointment.client)
    if (!current || date < current) firstVisit.set(appointment.client, date)
  }

  const clientsInWindow = new Set(appointments.map((appointment) => appointment.client))

  return [...clientsInWindow].filter((clientId) => {
    const first = firstVisit.get(clientId)
    return Boolean(first && first >= window.from && first < window.to)
  }).length
}

function cancelRate(appointments: Appointment[]) {
  if (!appointments.length) return 0

  const lost = appointments.filter(
    (appointment) => appointment.status === 'cancelled' || appointment.status === 'no_show',
  ).length

  return (lost / appointments.length) * 100
}

/** Свод показателей за период и за такой же предыдущий период — для сравнения. */
export function computeAnalytics(periodDays: number, now = new Date()): AnalyticsSummary {
  const to = startOfDay(addDays(now, 1))
  const current: Window = { from: addDays(to, -periodDays), to }
  const previous: Window = { from: addDays(to, -periodDays * 2), to: current.from }

  const inCurrent = db.appointments.filter((item) => inWindow(item, current))
  const inPrevious = db.appointments.filter((item) => inWindow(item, previous))

  const completedNow = inCurrent.filter((item) => item.status === 'completed').length
  const completedBefore = inPrevious.filter((item) => item.status === 'completed').length
  const revenueNow = revenueOf(inCurrent)
  const revenueBefore = revenueOf(inPrevious)

  const availableNow = db.specialists
    .filter((specialist) => specialist.is_active)
    .reduce((sum, specialist) => sum + availableMinutes(specialist, current), 0)
  const availableBefore = db.specialists
    .filter((specialist) => specialist.is_active)
    .reduce((sum, specialist) => sum + availableMinutes(specialist, previous), 0)

  return {
    period_days: periodDays,
    currency: db.services[0]?.currency ?? 'KZT',
    revenue: metric(revenueNow, revenueBefore),
    appointments: metric(inCurrent.length, inPrevious.length),
    new_clients: metric(newClients(inCurrent, current), newClients(inPrevious, previous)),
    average_check: metric(
      completedNow ? revenueNow / completedNow : 0,
      completedBefore ? revenueBefore / completedBefore : 0,
    ),
    load_percent: metric(
      loadPercent(bookedMinutes(inCurrent), availableNow),
      loadPercent(bookedMinutes(inPrevious), availableBefore),
    ),
    cancel_rate: metric(cancelRate(inCurrent), cancelRate(inPrevious)),
    revenue_by_day: revenueByDay(inCurrent, current),
    specialist_load: specialistLoad(inCurrent, current),
    top_services: topServices(inCurrent),
    status_breakdown: appointmentStatuses.map((status) => ({
      status,
      count: inCurrent.filter((appointment) => appointment.status === status).length,
    })),
  }
}
