import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useJournalFilters } from './useJournalFilters'

const today = new Date(2026, 8, 24)

describe('useJournalFilters', () => {
  it('открывается на сегодняшнем дне', () => {
    const { result } = renderHook(() => useJournalFilters(today))

    expect(result.current.date).toBe('2026-09-24')
    expect(result.current.isToday).toBe(true)
    expect(result.current.view).toBe('board')
  })

  it('листает дни вперёд и назад', () => {
    const { result } = renderHook(() => useJournalFilters(today))

    act(() => result.current.shift(1))
    expect(result.current.date).toBe('2026-09-25')
    expect(result.current.isToday).toBe(false)

    act(() => result.current.shift(-2))
    expect(result.current.date).toBe('2026-09-23')
  })

  it('возвращает к сегодняшнему дню', () => {
    const { result } = renderHook(() => useJournalFilters(today))

    act(() => result.current.shift(5))
    act(() => result.current.goToToday())

    expect(result.current.isToday).toBe(true)
  })

  it('хранит фильтры по специалисту и статусу', () => {
    const { result } = renderHook(() => useJournalFilters(today))

    act(() => result.current.setSpecialist(3))
    act(() => result.current.setStatus('completed'))

    expect(result.current.specialist).toBe(3)
    expect(result.current.status).toBe('completed')
  })
})
