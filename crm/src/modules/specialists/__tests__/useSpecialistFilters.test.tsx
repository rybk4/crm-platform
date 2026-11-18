import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSpecialistFilters } from '../hooks/useSpecialistFilters'
import { emptySpecialistForm } from '../model'
import type { Specialist } from '../types'

const specialists: Specialist[] = Array.from({ length: 20 }, (_, index) => ({
  ...emptySpecialistForm(1),
  id: index + 1,
  full_name: `Specialist ${index + 1}`,
  branch_name: 'Branch',
  organization_id: 1,
  organization_name: 'Organization',
  services_count: 0,
  job_title: index < 10 ? 'Stylist' : 'Barber',
  is_active: index < 10,
}))

describe('useSpecialistFilters', () => {
  it('preserves the original order and splits the list into pages of nine', () => {
    const { result } = renderHook(() => useSpecialistFilters(specialists))
    expect(result.current.sort).toBe('none')
    expect(result.current.pageCount).toBe(3)
    expect(result.current.pageItems.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    act(() => result.current.setPage(3))
    expect(result.current.pageItems.map((item) => item.id)).toEqual([19, 20])
  })

  it('returns to the first page when search, profession, status or sorting changes', () => {
    const { result } = renderHook(() => useSpecialistFilters(specialists))
    act(() => result.current.setPage(3))
    act(() => result.current.setSearch('Specialist 20'))
    expect(result.current.page).toBe(1)
    expect(result.current.pageItems.map((item) => item.id)).toEqual([20])
    act(() => result.current.setSearch(''))
    act(() => result.current.setPage(2))
    act(() => result.current.setPosition('Barber'))
    expect(result.current.page).toBe(1)
    expect(result.current.items).toHaveLength(10)
    act(() => result.current.setPage(2))
    act(() => result.current.setStatus('active'))
    expect(result.current.page).toBe(1)
    expect(result.current.pageItems).toEqual([])
    act(() => result.current.setStatus('all'))
    act(() => result.current.setPage(2))
    act(() => result.current.setSort('recent'))
    expect(result.current.page).toBe(1)
  })

  it('clamps the selected page when the server list shrinks', () => {
    const { result, rerender } = renderHook(({ items }) => useSpecialistFilters(items), {
      initialProps: { items: specialists },
    })
    act(() => result.current.setPage(3))
    rerender({ items: specialists.slice(0, 10) })
    expect(result.current.page).toBe(2)
    expect(result.current.pageItems.map((item) => item.id)).toEqual([10])
  })
})
