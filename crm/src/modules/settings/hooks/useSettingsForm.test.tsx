import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import type { OrganizationProfile } from '../types'
import { useSettingsForm } from './useSettingsForm'

vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

const { notifications } = await import('@/lib/toast/notifications')

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

const profile: OrganizationProfile = {
  id: 1,
  name: 'Лаванда',
  phone: '+77051234567',
  email: '',
  city: null,
  address: '',
  working_days: '',
  description: '',
  avatar_url: null,
  photos: [{ id: 1, url: 'https://cdn/a.jpg' }],
}

function setup(mutateAsync = vi.fn().mockResolvedValue(profile)) {
  const update = { mutateAsync, isPending: false }
  const hook = renderHook(() => useSettingsForm({ profile, update }), { wrapper })
  return { ...hook, mutateAsync }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSettingsForm', () => {
  it('без правок форма чистая, после правки — грязная', () => {
    const { result } = setup()

    expect(result.current.dirty).toBe(false)
    act(() => result.current.patch('address', 'Абая, 44'))
    expect(result.current.dirty).toBe(true)
  })

  it('телефон при вводе раскладывается в маску', () => {
    const { result } = setup()

    act(() => result.current.patch('phone', '87011112233'))

    expect(result.current.form.phone).toBe('+7 (701) 111-22-33')
  })

  it('не отправляет форму с ошибками и показывает их на полях', async () => {
    const { result, mutateAsync } = setup()

    act(() => result.current.patch('name', ' '))
    await act(() => result.current.submit())

    expect(result.current.errors.name).toBe('settingsErrorRequired')
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('правка поля снимает его ошибку', async () => {
    const { result } = setup()

    act(() => result.current.patch('name', ''))
    await act(() => result.current.submit())
    act(() => result.current.patch('name', 'Новая'))

    expect(result.current.errors.name).toBeUndefined()
  })

  it('отправляет нормализованный payload', async () => {
    const { result, mutateAsync } = setup()

    act(() => result.current.patch('email', ' hi@lavanda.kz '))
    await act(() => result.current.submit())

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'hi@lavanda.kz',
        phone: '+77051234567',
        city: null,
        photo_urls: ['https://cdn/a.jpg'],
      }),
    )
  })

  it('отмена возвращает исходные данные', () => {
    const { result } = setup()

    act(() => result.current.removePhoto('https://cdn/a.jpg'))
    act(() => result.current.reset())

    expect(result.current.form.photo_urls).toEqual(['https://cdn/a.jpg'])
    expect(result.current.dirty).toBe(false)
  })

  it('добавляет фото и не дублирует один и тот же файл', async () => {
    const { result } = setup()
    const file = new File(['x'], 'hall.png', { type: 'image/png' })

    await act(() => result.current.addPhotos([file, file]))

    await waitFor(() => expect(result.current.form.photo_urls).toHaveLength(2))
  })

  it('отклоняет неподдерживаемый формат логотипа тостом', async () => {
    const { result } = setup()

    await act(() => result.current.pickAvatar(new File(['x'], 'logo.gif', { type: 'image/gif' })))

    expect(result.current.form.avatar_url).toBeNull()
    expect(notifications.error).toHaveBeenCalled()
  })

  it('при ошибке сервера сохраняет черновик', async () => {
    const { result } = setup(vi.fn().mockRejectedValue(new Error('boom')))

    act(() => result.current.patch('address', 'Абая, 44'))
    await act(() => result.current.submit())

    expect(result.current.form.address).toBe('Абая, 44')
  })
})
