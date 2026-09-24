import { describe, expect, it } from 'vitest'

import {
  addDays,
  atMinutes,
  dayKey,
  daysBetween,
  fromDayKey,
  isSameDay,
  minutesFromTime,
  minutesOfDay,
  shiftDayKey,
  startOfDay,
  timeFromMinutes,
  weekdayIndex,
} from './day'

describe('ключ дня', () => {
  it('дополняет месяц и день нулями', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('разбирает ключ обратно в локальную дату', () => {
    const date = fromDayKey('2026-09-24')

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(8)
    expect(date.getDate()).toBe(24)
  })

  it('сдвигает ключ через границу месяца', () => {
    expect(shiftDayKey('2026-01-31', 1)).toBe('2026-02-01')
    expect(shiftDayKey('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('арифметика дней', () => {
  it('обнуляет время в начале дня', () => {
    expect(startOfDay(new Date(2026, 5, 2, 18, 45, 12)).getHours()).toBe(0)
  })

  it('переносит дату через границу месяца', () => {
    expect(dayKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01')
  })

  it('считает разницу в днях без учёта времени', () => {
    expect(daysBetween(new Date(2026, 8, 1, 23, 0), new Date(2026, 8, 4, 1, 0))).toBe(3)
  })

  it('сравнивает дни, а не моменты', () => {
    expect(isSameDay(new Date(2026, 8, 24, 1), new Date(2026, 8, 24, 23))).toBe(true)
    expect(isSameDay(new Date(2026, 8, 24), new Date(2026, 8, 25))).toBe(false)
  })
})

describe('минуты и время', () => {
  it('считает понедельник нулевым днём недели', () => {
    expect(weekdayIndex(new Date(2026, 8, 21))).toBe(0)
    expect(weekdayIndex(new Date(2026, 8, 27))).toBe(6)
  })

  it('разбирает время в минуты и собирает обратно', () => {
    expect(minutesFromTime('09:30')).toBe(570)
    expect(timeFromMinutes(570)).toBe('09:30')
    expect(timeFromMinutes(0)).toBe('00:00')
  })

  it('не ломается на пустом времени', () => {
    expect(minutesFromTime('')).toBe(0)
  })

  it('строит момент внутри дня по минутам', () => {
    const moment = atMinutes(new Date(2026, 8, 24, 20), 8 * 60 + 15)

    expect(minutesOfDay(moment)).toBe(495)
    expect(moment.getDate()).toBe(24)
  })
})
