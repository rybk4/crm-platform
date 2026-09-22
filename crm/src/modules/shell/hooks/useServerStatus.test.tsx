import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { reportServerUnavailable, resetServerStatus } from '@/lib/api/serverStatus'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { useServerStatus } from './useServerStatus'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>{children}</LocaleProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  resetServerStatus()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  resetServerStatus()
})

describe('useServerStatus', () => {
  it('изначально считает сервер доступным', () => {
    const { result } = renderHook(() => useServerStatus(), { wrapper })

    expect(result.current.unavailable).toBe(false)
  })

  it('поднимает флаг, когда http-слой сообщил о недоступности', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const { result } = renderHook(() => useServerStatus(), { wrapper })

    act(() => reportServerUnavailable())

    await waitFor(() => expect(result.current.unavailable).toBe(true))
  })

  it('снимает флаг, когда health снова отвечает', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { result } = renderHook(() => useServerStatus(), { wrapper })

    act(() => reportServerUnavailable())
    await waitFor(() => expect(result.current.unavailable).toBe(true))

    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.unavailable).toBe(false))
  })

  it('оставляет флаг поднятым, пока health не отвечает', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const { result } = renderHook(() => useServerStatus(), { wrapper })

    act(() => reportServerUnavailable())
    await waitFor(() => expect(result.current.unavailable).toBe(true))

    await act(async () => {
      result.current.retry()
    })

    expect(result.current.unavailable).toBe(true)
  })

  it('сообщает о восстановлении тостом', async () => {
    const { notifications } = await import('@/lib/toast/notifications')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { result } = renderHook(() => useServerStatus(), { wrapper })

    act(() => reportServerUnavailable())
    await waitFor(() => expect(result.current.unavailable).toBe(true))

    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => expect(notifications.success).toHaveBeenCalled())
  })

  it('не опрашивает health, пока сервер считается доступным', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    vi.useFakeTimers()

    renderHook(() => useServerStatus(), { wrapper })
    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('перестаёт опрашивать health после размонтирования', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal('fetch', fetchMock)
    vi.useFakeTimers()

    const { unmount } = renderHook(() => useServerStatus(), { wrapper })
    act(() => reportServerUnavailable())
    act(() => {
      vi.advanceTimersByTime(6000)
    })
    const callsWhileMounted = fetchMock.mock.calls.length
    expect(callsWhileMounted).toBeGreaterThan(0)

    unmount()
    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(fetchMock).toHaveBeenCalledTimes(callsWhileMounted)
  })
})
