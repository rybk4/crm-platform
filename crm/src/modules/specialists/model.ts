import type { Specialist, SpecialistInput, WorkSchedule } from './types'

export const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export type WeekdayKey = (typeof weekdayKeys)[number]

const DEFAULT_START = '09:00'
const DEFAULT_END = '18:00'
const SUNDAY = 6

/** Время с бэкенда приходит как HH:MM:SS, полям формы нужно HH:MM. */
function toTimeInput(value: string | null) {
  return value?.slice(0, 5) ?? null
}

export function defaultSchedule(): WorkSchedule[] {
  return weekdayKeys.map((_, weekday) => ({
    weekday,
    is_day_off: weekday === SUNDAY,
    start_time: weekday === SUNDAY ? null : DEFAULT_START,
    end_time: weekday === SUNDAY ? null : DEFAULT_END,
    break_start: null,
    break_end: null,
  }))
}

export function emptySpecialistForm(branchId = 0): SpecialistInput {
  return {
    branch: branchId,
    first_name: '',
    last_name: '',
    middle_name: '',
    job_title: '',
    phone_number: '',
    photo_url: '',
    bio: '',
    is_active: true,
    certificates: [],
    schedule: defaultSchedule(),
  }
}

export function specialistToForm(specialist: Specialist): SpecialistInput {
  const schedule = defaultSchedule().map((day) => {
    const stored = specialist.schedule.find((item) => item.weekday === day.weekday)
    if (!stored) return day

    return {
      ...stored,
      start_time: toTimeInput(stored.start_time),
      end_time: toTimeInput(stored.end_time),
      break_start: toTimeInput(stored.break_start),
      break_end: toTimeInput(stored.break_end),
    }
  })

  return {
    ...specialist,
    schedule,
    certificates: specialist.certificates.map((item) => ({ ...item })),
  }
}

/** Пустые строки сертификата бэкенду не нужны — это следы незаполненной строки формы. */
export function toSpecialistPayload(form: SpecialistInput): SpecialistInput {
  return {
    ...form,
    certificates: form.certificates.filter((item) => item.title.trim() && item.image_url.trim()),
  }
}

export function isSpecialistFormValid(form: SpecialistInput) {
  return Boolean(form.branch && form.first_name.trim() && form.last_name.trim())
}

export function specialistInitials(specialist: Specialist) {
  return `${specialist.first_name[0] ?? ''}${specialist.last_name[0] ?? ''}`.toUpperCase()
}

export function scheduleDayLabel(day: WorkSchedule) {
  if (day.is_day_off) return null
  return `${toTimeInput(day.start_time)}–${toTimeInput(day.end_time)}`
}

export type SpecialistStatusFilter = 'all' | 'active' | 'inactive'
export type SpecialistSort = 'name' | 'position' | 'recent'

interface SpecialistListFilters {
  search: string
  status: SpecialistStatusFilter
  sort: SpecialistSort
  position: string
}

export function filterSpecialists(
  specialists: readonly Specialist[],
  { search, status, sort, position }: SpecialistListFilters,
) {
  const query = search.trim().toLowerCase()
  const filtered = specialists.filter((specialist) => {
    const matchesSearch = !query
      ? true
      : `${specialist.full_name} ${specialist.phone_number} ${specialist.job_title}`
          .toLowerCase()
          .includes(query)
    const matchesStatus = status === 'all' || specialist.is_active === (status === 'active')
    const matchesPosition = !position || specialist.job_title === position

    return matchesSearch && matchesStatus && matchesPosition
  })

  return [...filtered].sort((left, right) => {
    if (sort === 'name') return left.full_name.localeCompare(right.full_name)
    if (sort === 'position') return left.job_title.localeCompare(right.job_title)
    return right.id - left.id
  })
}

export function scheduleSummary(schedule: readonly WorkSchedule[]) {
  const workingDays = schedule.filter((day) => !day.is_day_off)
  const weeklyMinutes = workingDays.reduce((total, day) => {
    if (!day.start_time || !day.end_time) return total
    const [startHour, startMinute] = day.start_time.split(':').map(Number)
    const [endHour, endMinute] = day.end_time.split(':').map(Number)
    let breakMinutes = 0

    if (day.break_start && day.break_end) {
      const [breakStartHour, breakStartMinute] = day.break_start.split(':').map(Number)
      const [breakEndHour, breakEndMinute] = day.break_end.split(':').map(Number)
      breakMinutes = breakEndHour * 60 + breakEndMinute - (breakStartHour * 60 + breakStartMinute)
    }

    return total + endHour * 60 + endMinute - (startHour * 60 + startMinute) - breakMinutes
  }, 0)

  return { workingDays: workingDays.length, weeklyHours: Math.max(weeklyMinutes / 60, 0) }
}

export interface SchedulePreviewDay {
  key: string
  label: string
  working: boolean
  interval: string | null
}

export function upcomingScheduleDays(
  schedule: readonly WorkSchedule[],
  startDate = new Date(),
): SchedulePreviewDay[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + offset)
    const weekday = (date.getDay() + 6) % 7
    const day = schedule.find((item) => item.weekday === weekday)
    const dayNumber = `${date.getDate()}`.padStart(2, '0')
    const monthNumber = `${date.getMonth() + 1}`.padStart(2, '0')

    return {
      key: `${date.getFullYear()}-${monthNumber}-${dayNumber}`,
      label: `${dayNumber}.${monthNumber}`,
      working: Boolean(day && !day.is_day_off),
      interval: day ? scheduleDayLabel(day) : null,
    }
  })
}
