import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { useSpecialistDialog } from './useSpecialistDialog'
import type { Specialist } from '../types'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

const { notifications } = await import('@/lib/toast/notifications')

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

function makeSpecialists() {
  return {
    create: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    update: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
  } as unknown as Parameters<typeof useSpecialistDialog>[0]['specialists']
}

const existing: Specialist = {
  id: 42,
  branch: 2,
  branch_name: 'Центр',
  organization_id: 1,
  organization_name: 'Салон',
  first_name: 'Айдана',
  last_name: 'Серик',
  middle_name: '',
  full_name: 'Серик Айдана',
  job_title: 'Мастер',
  phone_number: '',
  photo_url: '',
  bio: '',
  is_active: true,
  services_count: 0,
  certificates: [],
  schedule: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSpecialistDialog', () => {
  it('открывает создание с активным филиалом', () => {
    const { result } = renderHook(
      () => useSpecialistDialog({ defaultBranchId: 7, specialists: makeSpecialists() }),
      { wrapper },
    )

    act(() => result.current.openCreate())

    expect(result.current.open).toBe(true)
    expect(result.current.editing).toBeNull()
    expect(result.current.form.branch).toBe(7)
  })

  it('открывает редактирование с данными специалиста', () => {
    const { result } = renderHook(
      () => useSpecialistDialog({ defaultBranchId: 7, specialists: makeSpecialists() }),
      { wrapper },
    )

    act(() => result.current.openEdit(existing))

    expect(result.current.editing).toEqual(existing)
    expect(result.current.form.first_name).toBe('Айдана')
    expect(result.current.form.schedule).toHaveLength(7)
  })

  it('не отправляет незаполненную форму и показывает ошибку', async () => {
    const specialists = makeSpecialists()
    const { result } = renderHook(() => useSpecialistDialog({ defaultBranchId: 7, specialists }), {
      wrapper,
    })

    act(() => result.current.openCreate())
    await act(async () => {
      await result.current.submit()
    })

    expect(specialists.create.mutateAsync).not.toHaveBeenCalled()
    expect(notifications.error).toHaveBeenCalled()
    expect(result.current.open).toBe(true)
  })

  it('создаёт специалиста и закрывает диалог', async () => {
    const specialists = makeSpecialists()
    const { result } = renderHook(() => useSpecialistDialog({ defaultBranchId: 7, specialists }), {
      wrapper,
    })

    act(() => result.current.openCreate())
    act(() => result.current.patch({ first_name: 'Айдана', last_name: 'Серик' }))
    await act(async () => {
      await result.current.submit()
    })

    expect(specialists.create.mutateAsync).toHaveBeenCalledOnce()
    await waitFor(() => expect(result.current.open).toBe(false))
  })

  it('при редактировании отправляет обновление с идентификатором', async () => {
    const specialists = makeSpecialists()
    const { result } = renderHook(() => useSpecialistDialog({ defaultBranchId: 7, specialists }), {
      wrapper,
    })

    act(() => result.current.openEdit(existing))
    await act(async () => {
      await result.current.submit()
    })

    expect(specialists.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }))
  })

  it('оставляет диалог открытым, если сервер отверг сохранение', async () => {
    const specialists = makeSpecialists()
    vi.mocked(specialists.create.mutateAsync).mockRejectedValue(new Error('отказ'))
    const { result } = renderHook(() => useSpecialistDialog({ defaultBranchId: 7, specialists }), {
      wrapper,
    })

    act(() => result.current.openCreate())
    act(() => result.current.patch({ first_name: 'Айдана', last_name: 'Серик' }))
    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.open).toBe(true)
  })

  it('правит расписание и сертификаты точечно', () => {
    const { result } = renderHook(
      () => useSpecialistDialog({ defaultBranchId: 7, specialists: makeSpecialists() }),
      { wrapper },
    )

    act(() => result.current.openCreate())
    act(() => result.current.patchScheduleDay(0, { start_time: '11:00' }))
    act(() => result.current.addCertificate())
    act(() => result.current.patchCertificate(0, { title: 'Диплом' }))

    expect(result.current.form.schedule[0].start_time).toBe('11:00')
    expect(result.current.form.schedule[1].start_time).toBe('09:00')
    expect(result.current.form.certificates[0].title).toBe('Диплом')

    act(() => result.current.removeCertificate(0))
    expect(result.current.form.certificates).toHaveLength(0)
  })
})
