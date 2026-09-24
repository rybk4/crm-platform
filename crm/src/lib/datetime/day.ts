export const MINUTES_IN_HOUR = 60

export function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Момент внутри дня по числу минут от полуночи. */
export function atMinutes(day: Date, minutes: number) {
  const copy = startOfDay(day)
  copy.setMinutes(minutes)
  return copy
}

/** Локальный день в формате YYYY-MM-DD — ключ фильтра журнала. */
export function dayKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function fromDayKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function shiftDayKey(key: string, days: number) {
  return dayKey(addDays(fromDayKey(key), days))
}

/** Понедельник — 0, воскресенье — 6: так же нумерует расписание специалиста. */
export function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

export function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * MINUTES_IN_HOUR + (minutes || 0)
}

export function timeFromMinutes(minutes: number) {
  const hours = Math.floor(minutes / MINUTES_IN_HOUR)
  const rest = minutes % MINUTES_IN_HOUR
  return `${`${hours}`.padStart(2, '0')}:${`${rest}`.padStart(2, '0')}`
}

export function minutesOfDay(date: Date) {
  return date.getHours() * MINUTES_IN_HOUR + date.getMinutes()
}

export function isSameDay(left: Date, right: Date) {
  return dayKey(left) === dayKey(right)
}

export function daysBetween(from: Date, to: Date) {
  const span = startOfDay(to).getTime() - startOfDay(from).getTime()
  return Math.round(span / 86400000)
}
