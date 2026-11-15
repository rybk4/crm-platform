import { describe, expect, it } from 'vitest'
import { calendarDays, journalWeek } from '../calendarModel'

describe('journal calendar', () => {
  it('builds six Monday-first weeks including adjacent months', () => {
    const days = calendarDays('2026-10-21')
    expect(days).toHaveLength(42)
    expect(days[0]).toBe('2026-09-28')
    expect(days[41]).toBe('2026-11-08')
  })
  it('handles leap day and a week across the year boundary', () => {
    expect(calendarDays('2024-02-01')).toContain('2024-02-29')
    expect(journalWeek('2027-01-01')).toEqual({ from: '2026-12-28', to: '2027-01-03' })
  })
})
