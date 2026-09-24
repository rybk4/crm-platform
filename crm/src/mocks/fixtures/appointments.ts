import type { Appointment, AppointmentSource, AppointmentStatus } from '@/modules/journal/types'
import type { Service } from '@/modules/services/types'
import type { Specialist } from '@/modules/specialists/types'
import { addDays, atMinutes, minutesFromTime, startOfDay, weekdayIndex } from '@/lib/datetime/day'
import { createRandom, type Random } from '../random'
import { clients, newcomerEntryDay } from './clients'
import { services } from './services'
import { specialists } from './specialists'

const HISTORY_DAYS = 90
const FUTURE_DAYS = 14
const SEED = 20260924

const sources: AppointmentSource[] = ['online', 'crm', 'phone']

/** Постоянные клиенты должны попадаться чаще случайных — иначе не видно сегментов. */
function clientPool(dayOffset: number) {
  return clients.flatMap((client, index) => {
    const entryDay = newcomerEntryDay.get(client.id)
    if (entryDay !== undefined && dayOffset < entryDay) return []

    const weight = index < 6 ? 6 : index < 26 ? 3 : 1
    return Array.from({ length: weight }, () => client)
  })
}

function pastStatus(random: Random): AppointmentStatus {
  const roll = random.next()
  if (roll < 0.82) return 'completed'
  if (roll < 0.93) return 'cancelled'
  return 'no_show'
}

function futureStatus(random: Random): AppointmentStatus {
  return random.chance(0.65) ? 'confirmed' : 'pending'
}

interface DayWindow {
  open: number
  close: number
  breakStart: number | null
  breakEnd: number | null
}

function dayWindow(specialist: Specialist, day: Date): DayWindow | null {
  const schedule = specialist.schedule.find((item) => item.weekday === weekdayIndex(day))
  if (!schedule || schedule.is_day_off || !schedule.start_time || !schedule.end_time) return null

  return {
    open: minutesFromTime(schedule.start_time),
    close: minutesFromTime(schedule.end_time),
    breakStart: schedule.break_start ? minutesFromTime(schedule.break_start) : null,
    breakEnd: schedule.break_end ? minutesFromTime(schedule.break_end) : null,
  }
}

function overlapsBreak(window: DayWindow, start: number, end: number) {
  if (window.breakStart === null || window.breakEnd === null) return false
  return start < window.breakEnd && end > window.breakStart
}

interface BuildOptions {
  id: number
  specialist: Specialist
  service: Service
  day: Date
  startMinutes: number
  now: Date
  random: Random
  pool: readonly (typeof clients)[number][]
}

function buildAppointment({
  id,
  specialist,
  service,
  day,
  startMinutes,
  now,
  random,
  pool,
}: BuildOptions): Appointment {
  const startsAt = atMinutes(day, startMinutes)
  const endsAt = atMinutes(day, startMinutes + service.duration_minutes)
  const client = random.pick(pool)
  const status = startsAt < now ? pastStatus(random) : futureStatus(random)

  return {
    id,
    branch: specialist.branch,
    branch_name: specialist.branch_name,
    specialist: specialist.id,
    specialist_name: specialist.full_name,
    service: service.id,
    service_name: service.name,
    client: client.id,
    client_name: client.name,
    client_phone: client.phone_number,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    duration_minutes: service.duration_minutes,
    price: service.price,
    currency: service.currency,
    status,
    source: random.chance(0.45) ? 'online' : random.pick(sources),
    comment: random.chance(0.18) ? 'Просил(а) позвонить за час до визита.' : '',
    created_at: addDays(startsAt, -random.int(1, 6)).toISOString(),
  }
}

/**
 * Записи на 90 дней назад и 14 вперёд: журнал, карточки клиентов и аналитика
 * считаются по одному и тому же набору, поэтому цифры в разделах сходятся.
 */
export function generateAppointments(now = new Date()): Appointment[] {
  const random = createRandom(SEED)
  const today = startOfDay(now)
  const result: Appointment[] = []
  let id = 1

  for (let offset = -HISTORY_DAYS; offset <= FUTURE_DAYS; offset += 1) {
    const day = addDays(today, offset)
    const pool = clientPool(offset)

    for (const specialist of specialists) {
      if (!specialist.is_active) continue

      const window = dayWindow(specialist, day)
      if (!window) continue

      const specialistServices = services.filter(
        (service) => service.specialist === specialist.id && service.is_active,
      )
      if (!specialistServices.length) continue

      // Ближе к выходным салон загружен плотнее, чем в начале недели.
      const density = weekdayIndex(day) >= 4 ? 0.85 : 0.65
      let cursor = window.open

      while (cursor < window.close) {
        const service = random.pick(specialistServices)
        const end = cursor + service.duration_minutes

        if (end > window.close || overlapsBreak(window, cursor, end)) {
          cursor += 15
          continue
        }

        if (random.chance(density)) {
          result.push(
            buildAppointment({
              id,
              specialist,
              service,
              day,
              startMinutes: cursor,
              now,
              random,
              pool,
            }),
          )
          id += 1
          cursor = end + random.int(0, 2) * 15
        } else {
          cursor += 30
        }
      }
    }
  }

  return result
}
