import { describe, expect, it } from 'vitest'

import type { Client } from '@/modules/clients/types'
import type { Appointment } from '@/modules/journal/types'
import type { Specialist, WorkSchedule } from '@/modules/specialists/types'
import {
  dayElapsedPercent,
  dayProgress,
  greetingKey,
  newClients,
  newClientsThisWeek,
  specialistDayLoad,
  upcomingAppointments,
} from './model'

// 24 сентября 2026 — четверг, в расписании это день с индексом 3.
const day = new Date(2026, 8, 24)

function workday(weekday: number, start = '09:00:00', end = '18:00:00'): WorkSchedule {
  return {
    weekday,
    is_day_off: false,
    start_time: start,
    end_time: end,
    break_start: null,
    break_end: null,
  }
}

function makeSpecialist(id: number, schedule: WorkSchedule[], isActive = true): Specialist {
  return {
    id,
    branch: 1,
    branch_name: 'Центр',
    organization_id: 1,
    organization_name: 'Студия',
    first_name: 'Дина',
    last_name: 'Абенова',
    middle_name: '',
    full_name: `Мастер ${id}`,
    job_title: '',
    phone_number: '',
    photo_url: '',
    bio: '',
    is_active: isActive,
    services_count: 0,
    certificates: [],
    schedule,
  }
}

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 1,
    branch: 1,
    branch_name: 'Центр',
    specialist: 1,
    specialist_name: 'Мастер 1',
    service: 1,
    service_name: 'Маникюр',
    client: 1,
    client_name: 'Алия',
    client_phone: '',
    starts_at: new Date(2026, 8, 24, 10).toISOString(),
    ends_at: new Date(2026, 8, 24, 11).toISOString(),
    duration_minutes: 60,
    price: '9000',
    currency: 'KZT',
    status: 'confirmed',
    source: 'crm',
    comment: '',
    created_at: new Date(2026, 8, 20).toISOString(),
    ...overrides,
  }
}

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    organization_id: 1,
    name: 'Алия',
    phone_number: '',
    email: '',
    birthday: null,
    note: '',
    segment: 'new',
    visits_count: 1,
    total_spent: '9000',
    average_check: '9000',
    currency: 'KZT',
    first_visit_at: new Date(2026, 8, 20).toISOString(),
    last_visit_at: new Date(2026, 8, 20).toISOString(),
    created_at: new Date(2026, 2, 1).toISOString(),
    ...overrides,
  }
}

describe('greetingKey', () => {
  it('выбирает приветствие по времени суток', () => {
    expect(greetingKey(3)).toBe('greetingNight')
    expect(greetingKey(9)).toBe('greetingMorning')
    expect(greetingKey(14)).toBe('greetingDay')
    expect(greetingKey(21)).toBe('greetingEvening')
  })
})

describe('specialistDayLoad', () => {
  const working = makeSpecialist(1, [workday(3)])
  const resting = makeSpecialist(2, [{ ...workday(3), is_day_off: true }])

  it('считает долю занятого времени и пропускает выходных', () => {
    const load = specialistDayLoad([working, resting], [makeAppointment()], day)

    expect(load).toHaveLength(1)
    expect(load[0]).toMatchObject({ id: 1, bookedMinutes: 60, availableMinutes: 540 })
    expect(load[0].percent).toBe(11)
  })

  it('не учитывает отменённые записи', () => {
    const load = specialistDayLoad([working], [makeAppointment({ status: 'cancelled' })], day)

    expect(load[0].bookedMinutes).toBe(0)
  })

  it('пропускает отключённых специалистов', () => {
    expect(specialistDayLoad([makeSpecialist(3, [workday(3)], false)], [], day)).toHaveLength(0)
  })

  it('сортирует по убыванию загрузки', () => {
    const second = makeSpecialist(2, [workday(3)])
    const load = specialistDayLoad(
      [working, second],
      [makeAppointment({ specialist: 2, duration_minutes: 180 })],
      day,
    )

    expect(load[0].id).toBe(2)
  })
})

describe('upcomingAppointments', () => {
  const now = new Date(2026, 8, 24, 12)

  it('оставляет только то, что ещё не закончилось', () => {
    const past = makeAppointment({ id: 1 })
    const future = makeAppointment({
      id: 2,
      starts_at: new Date(2026, 8, 24, 15).toISOString(),
      ends_at: new Date(2026, 8, 24, 16).toISOString(),
    })

    expect(upcomingAppointments([past, future], now, 5).map((item) => item.id)).toEqual([2])
  })

  it('не показывает отменённые и соблюдает лимит', () => {
    const items = [1, 2, 3].map((id) =>
      makeAppointment({
        id,
        starts_at: new Date(2026, 8, 24, 13 + id).toISOString(),
        ends_at: new Date(2026, 8, 24, 14 + id).toISOString(),
        status: id === 1 ? 'cancelled' : 'confirmed',
      }),
    )

    expect(upcomingAppointments(items, now, 1).map((item) => item.id)).toEqual([2])
  })
})

describe('dayProgress', () => {
  it('делит день на завершённое и оставшееся, отменённые не считает', () => {
    const progress = dayProgress(
      [
        makeAppointment({ id: 1, status: 'completed' }),
        makeAppointment({
          id: 2,
          starts_at: new Date(2026, 8, 24, 16).toISOString(),
          ends_at: new Date(2026, 8, 24, 17).toISOString(),
        }),
        makeAppointment({ id: 3, status: 'cancelled', price: '5000' }),
      ],
      new Date(2026, 8, 24, 12),
    )

    expect(progress).toEqual({ completed: 1, remaining: 1, revenue: 18000 })
  })
})

describe('newClients', () => {
  const now = new Date(2026, 8, 24)

  it('берёт клиентов с первым визитом внутри окна', () => {
    const fresh = makeClient({ id: 1 })
    const old = makeClient({ id: 2, first_visit_at: new Date(2026, 5, 1).toISOString() })

    expect(newClients([fresh, old], now).map((item) => item.id)).toEqual([1])
  })

  it('пропускает тех, кто ещё не приходил', () => {
    expect(newClients([makeClient({ first_visit_at: null })], now)).toHaveLength(0)
  })

  it('считает недельных отдельно от месячных', () => {
    const lastWeek = makeClient({ id: 1, first_visit_at: new Date(2026, 8, 22).toISOString() })
    const lastMonth = makeClient({ id: 2, first_visit_at: new Date(2026, 8, 1).toISOString() })

    expect(newClients([lastWeek, lastMonth], now)).toHaveLength(2)
    expect(newClientsThisWeek([lastWeek, lastMonth], now)).toBe(1)
  })
})

describe('dayElapsedPercent', () => {
  const specialists = [makeSpecialist(1, [workday(3, '10:00:00', '20:00:00')])]

  it('показывает ноль до открытия и сто после закрытия', () => {
    expect(dayElapsedPercent(specialists, day, new Date(2026, 8, 24, 8))).toBe(0)
    expect(dayElapsedPercent(specialists, day, new Date(2026, 8, 24, 23))).toBe(100)
  })

  it('считает долю прошедшего рабочего времени', () => {
    expect(dayElapsedPercent(specialists, day, new Date(2026, 8, 24, 15))).toBe(50)
  })

  it('возвращает ноль, когда никто не работает', () => {
    expect(dayElapsedPercent([], day, new Date(2026, 8, 24, 15))).toBe(0)
  })
})
