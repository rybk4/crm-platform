import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useJournalCalendar } from '../hooks/useJournalCalendar'

describe('useJournalCalendar', () => {
  it('selects a day and closes the calendar', () => {
    const onDate = vi.fn()
    const onRange = vi.fn()
    const { result } = renderHook(() => useJournalCalendar('2026-10-21', false, onDate, onRange))
    act(() => result.current.open(document.createElement('button')))
    act(() => result.current.select('2026-10-23'))
    expect(onDate).toHaveBeenCalledExactlyOnceWith('2026-10-23')
    expect(result.current.anchor).toBeNull()
    expect(onRange).not.toHaveBeenCalled()
  })
  it('waits for both range endpoints and normalizes reverse selection', () => {
    const onDate = vi.fn()
    const onRange = vi.fn()
    const { result } = renderHook(() => useJournalCalendar('2026-10-21', true, onDate, onRange))
    act(() => result.current.open(document.createElement('button')))
    act(() => result.current.select('2026-10-25'))
    expect(onRange).not.toHaveBeenCalled()
    expect(result.current.anchor).not.toBeNull()
    act(() => result.current.select('2026-10-20'))
    expect(onRange).toHaveBeenCalledExactlyOnceWith({ from: '2026-10-20', to: '2026-10-25' })
    expect(onDate).not.toHaveBeenCalled()
  })
  it('moves from the end of a month without skipping February and resets unfinished ranges', () => {
    const { result } = renderHook(() => useJournalCalendar('2026-01-31', true, vi.fn(), vi.fn()))
    act(() => result.current.open(document.createElement('button')))
    act(() => result.current.move(1))
    expect(result.current.month).toBe('2026-02-01')
    act(() => result.current.select('2026-02-15'))
    act(() => result.current.close())
    act(() => result.current.open(document.createElement('button')))
    expect(result.current.month).toBe('2026-01-31')
    expect(result.current.from).toBeNull()
  })
})
