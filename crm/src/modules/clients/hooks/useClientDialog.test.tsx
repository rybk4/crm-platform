import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { makeClient } from '../testClient'
import { useClientDialog } from './useClientDialog'

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

function setup(mutateAsync = vi.fn().mockResolvedValue(makeClient())) {
  const clients = { create: { mutateAsync } } as unknown as Parameters<
    typeof useClientDialog
  >[0]['clients']
  const hook = renderHook(() => useClientDialog({ clients }), { wrapper })
  return { ...hook, mutateAsync }
}

describe('useClientDialog', () => {
  it('открывается с пустой формой', () => {
    const { result } = setup()

    act(() => result.current.patch('first_name', 'Черновик'))
    act(() => result.current.openCreate())

    expect(result.current.open).toBe(true)
    expect(result.current.form.first_name).toBe('')
  })

  it('не отправляет форму с ошибками и показывает их на полях', async () => {
    const { result, mutateAsync } = setup()

    act(() => result.current.openCreate())
    await act(() => result.current.submit())

    expect(result.current.errors.first_name).toBe('clientErrorRequired')
    expect(mutateAsync).not.toHaveBeenCalled()
    expect(result.current.open).toBe(true)
  })

  it('маскирует телефон, отправляет нормализованные данные и закрывается', async () => {
    const { result, mutateAsync } = setup()

    act(() => result.current.openCreate())
    act(() => result.current.patch('first_name', 'Дана'))
    act(() => result.current.patch('phone_number', '87015551122'))
    await act(() => result.current.submit())

    expect(result.current.form.phone_number).toBe('+7 (701) 555-11-22')
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Дана',
        phone_number: '+77015551122',
        status: 'basic',
      }),
    )
    expect(result.current.open).toBe(false)
  })

  it('при ошибке сервера оставляет окно открытым', async () => {
    const { result } = setup(vi.fn().mockRejectedValue(new Error('boom')))

    act(() => result.current.openCreate())
    act(() => result.current.patch('first_name', 'Дана'))
    act(() => result.current.patch('phone_number', '87015551122'))
    await act(() => result.current.submit())

    expect(result.current.open).toBe(true)
  })
})
