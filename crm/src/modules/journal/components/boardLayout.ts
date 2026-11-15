import type { DayWindow } from '../model'

/** Как в журнале ANA: получасовой слот высотой 50 px + 4 px между ячейками. */
export const MINUTE_PX = 1.8
export const RULER_STEP_MINUTES = 30
/** Высота шапки колонки. Совпадает с `--journal-head` в journal.css. */
export const HEAD_PX = 63

export function offsetPx(minutes: number, bounds: DayWindow, step = 30) {
  return Math.floor(Math.max(minutes - bounds.open, 0) / step) * 54
}

export function heightPx(durationMinutes: number, step = 30) {
  return Math.max(Math.ceil(durationMinutes / step), 1) * 54 - 4
}

export function boardHeightPx(bounds: DayWindow, step = 30) {
  return Math.ceil(Math.max(bounds.close - bounds.open, step) / step) * 54
}

/** Отметки часовой линейки, включая верхнюю границу дня. */
export function rulerMarks(bounds: DayWindow, step = 30) {
  const first = bounds.open
  const marks: number[] = []

  for (let minute = first; minute < bounds.close; minute += step) {
    marks.push(minute)
  }

  return marks
}
