import type { DayWindow } from '../model'

/** Как в журнале ANA: получасовой слот высотой 50 px + 4 px между ячейками. */
export const MINUTE_PX = 1.8
export const RULER_STEP_MINUTES = 30
/** Высота шапки колонки. Совпадает с `--journal-head` в journal.css. */
export const HEAD_PX = 63

export function offsetPx(minutes: number, bounds: DayWindow) {
  return Math.max(minutes - bounds.open, 0) * MINUTE_PX
}

export function heightPx(durationMinutes: number) {
  return Math.max(durationMinutes * MINUTE_PX - 4, 28)
}

export function boardHeightPx(bounds: DayWindow) {
  return Math.max(bounds.close - bounds.open, 60) * MINUTE_PX
}

/** Отметки часовой линейки, включая верхнюю границу дня. */
export function rulerMarks(bounds: DayWindow) {
  const first = Math.ceil(bounds.open / RULER_STEP_MINUTES) * RULER_STEP_MINUTES
  const marks: number[] = []

  for (let minute = first; minute < bounds.close; minute += RULER_STEP_MINUTES) {
    marks.push(minute)
  }

  return marks
}
