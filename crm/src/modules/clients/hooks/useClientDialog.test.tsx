import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { useClientDialog } from './useClientDialog'
import type { Client } from '../types'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

const { notifications } = await import('@/lib/toast/notifications')

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

function makeClients() {
  return {
    create: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    update: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
  } as unknown as Parameters<typeof useClientDialog>[0]['clients']
}

const existing: Client = {
  id: 4,
  organization_id: 1,
  name: 'Сергей Ким',
  phone_number: '+77011110002',
  email: '',
  birthday: null,
  note: '',
  segment: 'new',
  visits_count: 0,
  total_spent: '0',
  average_check: '0',
  currency: 'KZT',
  first_visit_at: null,
  last_visit_at: null,
  created_at: '2026-03-01T08:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useClientDialog', () => {
  it('открывает пустую форму на создание', () => {
    const { result } = renderHook(() => useClientDialog({ clients: makeClients() }), { wrapper })

    act(() => result.current.openCreate())

    expect(result.current.form.name).toBe('')
    expect(result.current.editing).toBeNull()
  })

  it('переносит клиента в форму при редактировании', () => {
    const { result } = renderHook(() => useClientDialog({ clients: makeClients() }), { wrapper })

    act(() => result.current.openEdit(existing))

    expect(result.current.form).toMatchObject({ name: 'Сергей Ким', phone_number: '+77011110002' })
  })

  it('не отправляет форму без телефона', async () => {
    const clients = makeClients()
    const { result } = renderHook(() => useClientDialog({ clients }), { wrapper })

    act(() => result.current.openCreate())
    act(() => result.current.patch({ name: 'Иван' }))
    await act(async () => {
      await result.current.submit()
    })

    expect(clients.create.mutateAsync).not.toHaveBeenCalled()
    expect(notifications.error).toHaveBeenCalled()
  })

  it('создаёт клиента и закрывает форму', async () => {
    const clients = makeClients()
    const { result } = renderHook(() => useClientDialog({ clients }), { wrapper })

    act(() => result.current.openCreate())
    act(() => result.current.patch({ name: 'Иван', phone_number: '+77010000000' }))
    await act(async () => {
      await result.current.submit()
    })

    expect(clients.create.mutateAsync).toHaveBeenCalledOnce()
    await waitFor(() => expect(result.current.open).toBe(false))
  })

  it('обновляет существующего клиента по идентификатору', async () => {
    const clients = makeClients()
    const { result } = renderHook(() => useClientDialog({ clients }), { wrapper })

    act(() => result.current.openEdit(existing))
    await act(async () => {
      await result.current.submit()
    })

    expect(clients.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }))
  })
})
