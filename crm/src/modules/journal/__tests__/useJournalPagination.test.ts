import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useJournalPagination } from '../hooks/useJournalPagination'
const size = vi.hoisted(() => ({ width: 1100 }))
vi.mock('@/lib/browser/useElementWidth', () => ({
  useElementWidth: () => ({ elementRef: { current: null }, width: size.width }),
}))
describe('journal staff pagination', () => {
  it('fits columns to the board and clamps the page after filtering', () => {
    const { result, rerender } = renderHook(({ total }) => useJournalPagination(total), {
      initialProps: { total: 12 },
    })
    expect(result.current.to).toBe(5)
    expect(result.current.pages).toBe(3)
    act(() => result.current.setPage(3))
    expect(result.current.from).toBe(10)
    rerender({ total: 2 })
    expect(result.current.page).toBe(1)
    size.width = 270
    rerender({ total: 2 })
    expect(result.current.to - result.current.from).toBe(1)
    expect(result.current.pages).toBe(2)
  })
})
