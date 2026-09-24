import { minutesFromTime, minutesOfDay, weekdayIndex } from '@/lib/datetime/day'
import type { TranslationKey } from '@/lib/i18n/messages'
import type { Specialist, WorkSchedule } from '@/modules/specialists/types'
import type { IconName } from '@/ui/Icon'
import type { StatusTone } from '@/ui/StatusPill'
import type { Appointment, AppointmentInput, AppointmentStatus } from './types'

interface StatusMeta {
  tone: StatusTone
  icon: IconName
  labelKey: TranslationKey
}

export const statusMeta: Record<AppointmentStatus, StatusMeta> = {
  pending: { tone: 'warning', icon: 'clock', labelKey: 'statusPending' },
  confirmed: { tone: 'info', icon: 'check', labelKey: 'statusConfirmed' },
  completed: { tone: 'success', icon: 'check-circle', labelKey: 'statusCompleted' },
  cancelled: { tone: 'neutral', icon: 'close', labelKey: 'statusCancelled' },
  no_show: { tone: 'danger', icon: 'ban', labelKey: 'statusNoShow' },
}

export const sourceLabelKeys: Record<Appointment['source'], TranslationKey> = {
  crm: 'appointmentSourceCrm',
  online: 'appointmentSourceOnline',
  phone: 'appointmentSourcePhone',
}

export interface DayWindow {
  open: number
  close: number
  breakStart: number | null
  breakEnd: number | null
}

const DEFAULT_WINDOW: DayWindow = { open: 9 * 60, close: 20 * 60, breakStart: null, breakEnd: null }

function toWindow(schedule: WorkSchedule | undefined): DayWindow | null {
  if (!schedule || schedule.is_day_off || !schedule.start_time || !schedule.end_time) return null

  return {
    open: minutesFromTime(schedule.start_time),
    close: minutesFromTime(schedule.end_time),
    breakStart: schedule.break_start ? minutesFromTime(schedule.break_start) : null,
    breakEnd: schedule.break_end ? minutesFromTime(schedule.break_end) : null,
  }
}

/** Рабочее окно специалиста в конкретный день или null, если это выходной. */
export function dayWindow(specialist: Specialist, day: Date) {
  return toWindow(specialist.schedule.find((item) => item.weekday === weekdayIndex(day)))
}

/** Границы сетки дня: от самого раннего открытия до самого позднего закрытия. */
export function boardBounds(specialists: readonly Specialist[], day: Date): DayWindow {
  const windows = specialists
    .map((specialist) => dayWindow(specialist, day))
    .filter((window): window is DayWindow => window !== null)

  if (!windows.length) return DEFAULT_WINDOW

  return {
    open: Math.min(...windows.map((window) => window.open)),
    close: Math.max(...windows.map((window) => window.close)),
    breakStart: null,
    breakEnd: null,
  }
}

export function appointmentRange(appointment: Appointment) {
  return {
    start: minutesOfDay(new Date(appointment.starts_at)),
    end: minutesOfDay(new Date(appointment.ends_at)),
  }
}

export function emptyAppointmentForm(specialistId = 0, startsAt = ''): AppointmentInput {
  return {
    specialist: specialistId,
    service: 0,
    client: 0,
    starts_at: startsAt,
    status: 'confirmed',
    comment: '',
  }
}

export function appointmentToForm(appointment: Appointment): AppointmentInput {
  return {
    specialist: appointment.specialist,
    service: appointment.service,
    client: appointment.client,
    starts_at: appointment.starts_at,
    status: appointment.status,
    comment: appointment.comment,
  }
}

export function isAppointmentFormValid(form: AppointmentInput) {
  return Boolean(form.specialist && form.service && form.client && form.starts_at)
}

/** Поля формы «дата» и «время» собираются в один ISO-момент. */
export function combineDateTime(day: string, time: string) {
  if (!day || !time) return ''

  const [year, month, date] = day.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)

  return new Date(year, month - 1, date, hours, minutes).toISOString()
}

export function splitStartsAt(startsAt: string) {
  if (!startsAt) return { day: '', time: '' }

  const date = new Date(startsAt)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return { day: `${date.getFullYear()}-${month}-${day}`, time: `${hours}:${minutes}` }
}

interface OverlapCandidate {
  specialist: number
  startsAt: string
  durationMinutes: number
  excludeId?: number
}

/** Двойная запись к одному специалисту — то, что сервер тоже не пропустит. */
export function hasOverlap(appointments: readonly Appointment[], candidate: OverlapCandidate) {
  if (!candidate.startsAt || !candidate.durationMinutes) return false

  const start = new Date(candidate.startsAt).getTime()
  const end = start + candidate.durationMinutes * 60000

  return appointments.some((item) => {
    if (item.id === candidate.excludeId || item.specialist !== candidate.specialist) return false
    if (item.status === 'cancelled') return false

    return start < new Date(item.ends_at).getTime() && end > new Date(item.starts_at).getTime()
  })
}

export interface DayTotals {
  count: number
  completed: number
  bookedMinutes: number
  revenue: number
}

/** Итоги дня считаем без отменённых: они не занимают время и не дают выручки. */
export function dayTotals(appointments: readonly Appointment[]): DayTotals {
  const counted = appointments.filter((item) => item.status !== 'cancelled')

  return {
    count: appointments.length,
    completed: counted.filter((item) => item.status === 'completed').length,
    bookedMinutes: counted.reduce((sum, item) => sum + item.duration_minutes, 0),
    revenue: counted.reduce((sum, item) => sum + Number(item.price), 0),
  }
}

export function sortByStart(appointments: readonly Appointment[]) {
  return [...appointments].sort((left, right) => left.starts_at.localeCompare(right.starts_at))
}

/** Сколько рабочих минут в дне у выбранных специалистов — знаменатель загрузки. */
export function availableMinutes(specialists: readonly Specialist[], day: Date) {
  return specialists.reduce((sum, specialist) => {
    const window = dayWindow(specialist, day)
    if (!window) return sum

    const pause =
      window.breakStart !== null && window.breakEnd !== null
        ? window.breakEnd - window.breakStart
        : 0

    return sum + Math.max(window.close - window.open - pause, 0)
  }, 0)
}
