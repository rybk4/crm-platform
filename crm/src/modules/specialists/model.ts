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
