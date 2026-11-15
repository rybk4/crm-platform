import { dayKey, fromDayKey, shiftDayKey } from '@/lib/datetime/day'
export interface JournalDateRange {
  from: string
  to: string
}
export function calendarDays(month: string) {
  const first = fromDayKey(month)
  first.setDate(1)
  const start = shiftDayKey(dayKey(first), -((first.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, offset) => shiftDayKey(start, offset))
}
export function journalWeek(date: string): JournalDateRange {
  const value = fromDayKey(date)
  const from = shiftDayKey(date, -((value.getDay() + 6) % 7))
  return { from, to: shiftDayKey(from, 6) }
}
