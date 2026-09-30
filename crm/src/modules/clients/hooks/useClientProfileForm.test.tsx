import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { makeClient } from '../testClient'
import { useClientProfileForm } from './useClientProfileForm'

const client = makeClient()

function setup(mutateAsync = vi.fn().mockResolvedValue({ ...client, first_name: 'Алина' })) {
  const clients = { update: { mutateAsync }, saving: false } as unknown as Parameters<
    typeof useClientProfileForm
  >[0]['clients']
  const hook = renderHook(() => useClientProfileForm({ client, clients }))
  return { ...hook, mutateAsync }
}

describe('useClientProfileForm', () => {
  it('без правок форма чистая, правка поля делает её грязной', () => {
    const { result } = setup()

    expect(result.current.dirty).toBe(false)
    act(() => result.current.patch('status', 'vip'))
    expect(result.current.dirty).toBe(true)
  })

  it('правка поля снимает его ошибку', async () => {
    const { result, mutateAsync } = setup()

    act(() => result.current.patch('email', 'bad'))
    await act(() => result.current.submit())
    expect(result.current.errors.email).toBe('clientErrorEmail')
    expect(mutateAsync).not.toHaveBeenCalled()

    act(() => result.current.patch('email', 'ok@example.kz'))
    expect(result.current.errors.email).toBeUndefined()
  })

  it('отправляет правки и принимает сохранённые данные', async () => {
    const { result, mutateAsync } = setup()

    act(() => result.current.patch('first_name', 'Алина'))
    await act(() => result.current.submit())

    expect(mutateAsync).toHaveBeenCalledWith({
      id: client.id,
      input: expect.objectContaining({ first_name: 'Алина', phone_number: '+77011110001' }),
    })
    expect(result.current.form.first_name).toBe('Алина')
  })

  it('сброс возвращает сохранённые данные', () => {
    const { result } = setup()

    act(() => result.current.patch('note', 'Черновик'))
    act(() => result.current.reset())

    expect(result.current.form.note).toBe('')
    expect(result.current.dirty).toBe(false)
  })
})
