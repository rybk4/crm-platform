import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { reportServerUnavailable, resetServerStatus } from '@/lib/api/serverStatus'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { ServerStatusBanner } from './ServerStatusBanner'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

function renderBanner() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>{children}</LocaleProvider>
    </QueryClientProvider>
  )
  return render(<ServerStatusBanner />, { wrapper: Wrapper })
}

beforeEach(() => {
  resetServerStatus()
})

afterEach(() => {
  vi.unstubAllGlobals()
  resetServerStatus()
})

describe('ServerStatusBanner', () => {
  it('ничего не рендерит, пока сервер доступен', () => {
    renderBanner()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('показывает плашку с кнопкой повтора, когда сервер недоступен', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    renderBanner()

    act(() => reportServerUnavailable())

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(screen.getByText('Сервер недоступен')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument()
  })

  it('убирает плашку после восстановления связи', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    renderBanner()

    act(() => reportServerUnavailable())
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })
})
