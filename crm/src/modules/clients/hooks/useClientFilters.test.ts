import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeClient } from '../testClient'
import { useClientFilters } from './useClientFilters'

const clients = Array.from({ length: 20 }, (_, index) =>
  makeClient({ id: index + 1, name: `Клиент ${index + 1}` }),
)

describe('useClientFilters', () => {
  it('в запрос уходят только применённые фильтры', () => {
    const { result } = renderHook(() => useClientFilters())

    act(() => result.current.patchDraft({ status: 'vip', service: '4', visit_date: '2026-09-01' }))
    expect(result.current.query).toEqual({})

    act(() => result.current.apply())
    expect(result.current.query).toEqual({ status: 'vip', service: 4, visit_date: '2026-09-01' })
    expect(result.current.activeCount).toBe(3)
    expect(result.current.panelOpen).toBe(false)
  })

  it('сброс очищает черновик и запрос', () => {
    const { result } = renderHook(() => useClientFilters())

    act(() => result.current.patchDraft({ status: 'blocked' }))
    act(() => result.current.apply())
    act(() => result.current.reset())

    expect(result.current.query).toEqual({})
    expect(result.current.draft.status).toBe('')
  })

  it('делит список на страницы и возвращается на первую при поиске', () => {
    const { result } = renderHook(() => useClientFilters())

    act(() => result.current.setPage(3))
    expect(result.current.view(clients)).toMatchObject({ page: 3, pages: 3, total: 20 })
    expect(result.current.view(clients).items).toHaveLength(2)

    act(() => result.current.setSearch('Клиент 1'))
    expect(result.current.view(clients)).toMatchObject({ page: 1, total: 11 })
  })

  it('не выходит за последнюю страницу, если список стал короче', () => {
    const { result } = renderHook(() => useClientFilters())

    act(() => result.current.setPage(3))
    expect(result.current.view(clients.slice(0, 5)).page).toBe(1)
  })
})
