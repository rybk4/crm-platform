import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import type { Service } from '@/modules/services/types'
import { useAppointmentDialog } from './useAppointmentDialog'
import type { Appointment } from '../types'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

const { notifications } = await import('@/lib/toast/notifications')

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

function makeJournal() {
  return {
    create: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
    update: { mutateAsync: vi.fn().mockResolvedValue(undefined) },
  } as unknown as Parameters<typeof useAppointmentDialog>[0]['journal']
}

const service: Service = {
  id: 5,
  specialist: 1,
  specialist_name: 'Абенова Дина',
  branch_id: 1,
  branch_name: 'Центр',
  organization_id: 1,
  name: 'Маникюр',
  description: '',
  duration_minutes: 60,
  price: '9000',
  currency: 'KZT',
  is_active: true,
}

const existing: Appointment = {
  id: 7,
  branch: 1,
  branch_name: 'Центр',
  specialist: 1,
  specialist_name: 'Абенова Дина',
  service: 5,
  service_name: 'Маникюр',
  client: 3,
  client_name: 'Алия',
  client_phone: '+77011110001',
  starts_at: new Date(2026, 8, 24, 10, 0).toISOString(),
  ends_at: new Date(2026, 8, 24, 11, 0).toISOString(),
  duration_minutes: 60,
  price: '9000',
  currency: 'KZT',
  status: 'confirmed',
  source: 'crm',
  comment: '',
  created_at: new Date(2026, 8, 20).toISOString(),
}

function setup(appointments: Appointment[] = []) {
  const journal = makeJournal()
  const view = renderHook(
    () =>
      useAppointmentDialog({
        appointments,
        services: [service],
        defaultDay: '2026-09-24',
        defaultSpecialistId: 1,
        journal,
      }),
    { wrapper },
  )

  return { journal, ...view }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAppointmentDialog', () => {
  it('подставляет день и специалиста при создании', () => {
    const { result } = setup()

    act(() => result.current.openCreate())

    expect(result.current.form.specialist).toBe(1)
    expect(result.current.day).toBe('2026-09-24')
    expect(result.current.editing).toBeNull()
  })

  it('подставляет специалиста и время выбранной ячейки журнала', () => {
    const { result } = setup()

    act(() => result.current.openCreate(4, '11:30'))

    expect(result.current.form.specialist).toBe(4)
    expect(result.current.time).toBe('11:30')
  })

  it('разбирает время записи на дату и время при редактировании', () => {
    const { result } = setup()

    act(() => result.current.openEdit(existing))

    expect(result.current.day).toBe('2026-09-24')
    expect(result.current.time).toBe('10:00')
    expect(result.current.form.service).toBe(5)
  })

  it('сбрасывает услугу при смене специалиста', () => {
    const { result } = setup()

    act(() => result.current.openEdit(existing))
    act(() => result.current.patchSpecialist(2))

    expect(result.current.form.service).toBe(0)
  })

  it('не отправляет форму без клиента', async () => {
    const { result, journal } = setup()

    act(() => result.current.openCreate())
    act(() => result.current.patch({ service: 5 }))
    await act(async () => {
      await result.current.submit()
    })

    expect(journal.create.mutateAsync).not.toHaveBeenCalled()
    expect(notifications.error).toHaveBeenCalled()
  })

  it('не даёт создать пересекающуюся запись', async () => {
    const { result, journal } = setup([existing])

    act(() => result.current.openCreate())
    act(() => result.current.patch({ service: 5, client: 3 }))
    act(() => result.current.setTime('10:30'))
    await act(async () => {
      await result.current.submit()
    })

    expect(journal.create.mutateAsync).not.toHaveBeenCalled()
    expect(notifications.error).toHaveBeenCalled()
  })

  it('создаёт запись и закрывает форму', async () => {
    const { result, journal } = setup([existing])

    act(() => result.current.openCreate())
    act(() => result.current.patch({ service: 5, client: 3 }))
    act(() => result.current.setTime('12:00'))
    await act(async () => {
      await result.current.submit()
    })

    expect(journal.create.mutateAsync).toHaveBeenCalledOnce()
    await waitFor(() => expect(result.current.open).toBe(false))
  })

  it('обновляет запись, не считая её пересечением с собой', async () => {
    const { result, journal } = setup([existing])

    act(() => result.current.openEdit(existing))
    await act(async () => {
      await result.current.submit()
    })

    expect(journal.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }))
  })
})
