import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { useServiceDialog } from './useServiceDialog'
import type { Service } from '../types'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

const { notifications } = await import('@/lib/toast/notifications')

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

function makeServices() {
  return {
    create: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    update: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
  } as unknown as Parameters<typeof useServiceDialog>[0]['services']
}

const existing: Service = {
  id: 9,
  specialist: 10,
  specialist_name: 'Серик Айдана',
  branch_id: 2,
  branch_name: 'Центр',
  organization_id: 1,
  name: 'Стрижка',
  description: 'Женская',
  duration_minutes: 45,
  price: '9000',
  currency: 'KZT',
  is_active: true,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useServiceDialog', () => {
  it('подставляет специалиста по умолчанию при создании', () => {
    const { result } = renderHook(
      () => useServiceDialog({ defaultSpecialistId: 10, services: makeServices() }),
      { wrapper },
    )

    act(() => result.current.openCreate())

    expect(result.current.form.specialist).toBe(10)
    expect(result.current.editing).toBeNull()
  })

  it('переносит услугу в форму при редактировании', () => {
    const { result } = renderHook(
      () => useServiceDialog({ defaultSpecialistId: 10, services: makeServices() }),
      { wrapper },
    )

    act(() => result.current.openEdit(existing))

    expect(result.current.form).toMatchObject({ name: 'Стрижка', duration_minutes: 45 })
  })

  it('не отправляет форму без цены', async () => {
    const services = makeServices()
    const { result } = renderHook(() => useServiceDialog({ defaultSpecialistId: 10, services }), {
      wrapper,
    })

    act(() => result.current.openCreate())
    act(() => result.current.patch({ name: 'Стрижка' }))
    await act(async () => {
      await result.current.submit()
    })

    expect(services.create.mutateAsync).not.toHaveBeenCalled()
    expect(notifications.error).toHaveBeenCalled()
  })

  it('создаёт услугу и закрывает диалог', async () => {
    const services = makeServices()
    const { result } = renderHook(() => useServiceDialog({ defaultSpecialistId: 10, services }), {
      wrapper,
    })

    act(() => result.current.openCreate())
    act(() => result.current.patch({ name: 'Стрижка', price: '9000' }))
    await act(async () => {
      await result.current.submit()
    })

    expect(services.create.mutateAsync).toHaveBeenCalledOnce()
    await waitFor(() => expect(result.current.open).toBe(false))
  })

  it('обновляет существующую услугу по идентификатору', async () => {
    const services = makeServices()
    const { result } = renderHook(() => useServiceDialog({ defaultSpecialistId: 10, services }), {
      wrapper,
    })

    act(() => result.current.openEdit(existing))
    await act(async () => {
      await result.current.submit()
    })

    expect(services.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 9 }))
  })
})
