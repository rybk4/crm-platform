import { describe, expect, it } from 'vitest'

import type { Specialist, WorkSchedule } from '@/modules/specialists/types'
import {
  appointmentToForm,
  availableMinutes,
  boardBounds,
  combineDateTime,
  dayTotals,
  dayWindow,
  emptyAppointmentForm,
  hasOverlap,
  isAppointmentFormValid,
  sortByStart,
  splitStartsAt,
} from './model'
import type { Appointment } from './types'

function schedule(overrides: Partial<WorkSchedule> & { weekday: number }): WorkSchedule {
  return {
    is_day_off: false,
    start_time: '09:00:00',
    end_time: '18:00:00',
    break_start: null,
    break_end: null,
    ...overrides,
  }
}

function makeSpecialist(id: number, days: WorkSchedule[]): Specialist {
  return {
    id,
    branch: 1,
    branch_name: 'Центр',
    organization_id: 1,
    organization_name: 'Студия',
    first_name: 'Дина',
    last_name: 'Абенова',
    middle_name: '',
    full_name: 'Абенова Дина',
    job_title: 'Мастер',
    phone_number: '',
    photo_url: '',
    bio: '',
    is_active: true,
    services_count: 0,
    certificates: [],
    schedule: days,
  }
}

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 1,
    branch: 1,
    branch_name: 'Центр',
    specialist: 1,
    specialist_name: 'Абенова Дина',
    service: 1,
    service_name: 'Маникюр',
    client: 1,
    client_name: 'Алия',
    client_phone: '+77011110001',
    starts_at: new Date(2026, 8, 24, 10, 0).toISOString(),
    ends_at: new Date(2026, 8, 24, 11, 0).toISOString(),
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

// 24 сентября 2026 — четверг, будний день недели с индексом 3.
const thursday = new Date(2026, 8, 24)

describe('рабочее окно дня', () => {
  it('возвращает границы рабочего дня в минутах', () => {
    const specialist = makeSpecialist(1, [schedule({ weekday: 3 })])

    expect(dayWindow(specialist, thursday)).toEqual({
      open: 540,
      close: 1080,
      breakStart: null,
      breakEnd: null,
    })
  })

  it('возвращает null в выходной', () => {
    const specialist = makeSpecialist(1, [schedule({ weekday: 3, is_day_off: true })])

    expect(dayWindow(specialist, thursday)).toBeNull()
  })

  it('берёт самое раннее открытие и самое позднее закрытие', () => {
    const early = makeSpecialist(1, [schedule({ weekday: 3, start_time: '08:00:00' })])
    const late = makeSpecialist(2, [schedule({ weekday: 3, end_time: '21:00:00' })])

    expect(boardBounds([early, late], thursday)).toMatchObject({ open: 480, close: 1260 })
  })

  it('подставляет дневные границы, когда никто не работает', () => {
    expect(boardBounds([], thursday)).toMatchObject({ open: 540, close: 1200 })
  })

  it('вычитает перерыв из доступного времени', () => {
    const specialist = makeSpecialist(1, [
      schedule({ weekday: 3, break_start: '13:00:00', break_end: '14:00:00' }),
    ])

    expect(availableMinutes([specialist], thursday)).toBe(480)
  })
})

describe('форма записи', () => {
  it('требует специалиста, услугу, клиента и время', () => {
    expect(isAppointmentFormValid(emptyAppointmentForm())).toBe(false)
    expect(
      isAppointmentFormValid({
        specialist: 1,
        service: 2,
        client: 3,
        starts_at: '2026-09-24T10:00:00.000Z',
        status: 'confirmed',
        comment: '',
      }),
    ).toBe(true)
  })

  it('переносит запись в форму без служебных полей', () => {
    expect(appointmentToForm(makeAppointment())).toEqual({
      specialist: 1,
      service: 1,
      client: 1,
      starts_at: makeAppointment().starts_at,
      status: 'confirmed',
      comment: '',
    })
  })

  it('собирает дату и время в момент и разбирает обратно', () => {
    const startsAt = combineDateTime('2026-09-24', '10:30')

    expect(splitStartsAt(startsAt)).toEqual({ day: '2026-09-24', time: '10:30' })
  })

  it('возвращает пустые части без даты', () => {
    expect(combineDateTime('', '10:30')).toBe('')
    expect(splitStartsAt('')).toEqual({ day: '', time: '' })
  })
})

describe('пересечения записей', () => {
  const existing = [makeAppointment()]

  it('находит наложение на занятое время', () => {
    expect(
      hasOverlap(existing, {
        specialist: 1,
        startsAt: new Date(2026, 8, 24, 10, 30).toISOString(),
        durationMinutes: 60,
      }),
    ).toBe(true)
  })

  it('разрешает запись встык', () => {
    expect(
      hasOverlap(existing, {
        specialist: 1,
        startsAt: new Date(2026, 8, 24, 11, 0).toISOString(),
        durationMinutes: 60,
      }),
    ).toBe(false)
  })

  it('не считает пересечением другого специалиста', () => {
    expect(
      hasOverlap(existing, {
        specialist: 2,
        startsAt: new Date(2026, 8, 24, 10, 30).toISOString(),
        durationMinutes: 60,
      }),
    ).toBe(false)
  })

  it('игнорирует отменённые записи и саму редактируемую', () => {
    const cancelled = [makeAppointment({ status: 'cancelled' })]
    const candidate = {
      specialist: 1,
      startsAt: new Date(2026, 8, 24, 10, 30).toISOString(),
      durationMinutes: 60,
    }

    expect(hasOverlap(cancelled, candidate)).toBe(false)
    expect(hasOverlap(existing, { ...candidate, excludeId: 1 })).toBe(false)
  })
})

describe('итоги дня', () => {
  it('не учитывает отменённые записи во времени и выручке', () => {
    const totals = dayTotals([
      makeAppointment(),
      makeAppointment({ id: 2, status: 'cancelled', price: '5000' }),
    ])

    expect(dayTotals([makeAppointment({ status: 'completed' })]).completed).toBe(1)

    expect(totals).toEqual({ count: 2, completed: 0, bookedMinutes: 60, revenue: 9000 })
  })

  it('сортирует записи по времени начала', () => {
    const late = makeAppointment({ id: 2, starts_at: new Date(2026, 8, 24, 15).toISOString() })
    const sorted = sortByStart([late, makeAppointment()])

    expect(sorted.map((item) => item.id)).toEqual([1, 2])
  })
})
