import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api/ApiError'
import { clearTokens, readTokens } from '@/lib/auth/tokenStorage'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { notifications } from '@/lib/toast/notifications'
import { authApi } from '../api/authApi'
import { useAuthFlow } from '../hooks/useAuthFlow'

vi.mock('../api/authApi', () => ({
  authApi: { requestOtp: vi.fn(), verifyOtp: vi.fn(), getCurrentUser: vi.fn() },
}))
vi.mock('@/lib/toast/notifications', () => ({
  notifications: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}

async function setup() {
  const hook = renderHook(() => useAuthFlow(), { wrapper })
  await waitFor(() => expect(hook.result.current.stage).toBe('phone'))
  return hook
}

beforeEach(() => {
  vi.resetAllMocks()
  clearTokens()
})

describe('useAuthFlow', () => {
  it('rejects an unknown user before the code step', async () => {
    vi.mocked(authApi.requestOtp).mockResolvedValue({
      user_exists: false,
      detail: 'Код отправлен.',
    })
    const { result } = await setup()

    await act(() => result.current.submitPhone('87001234567'))

    expect(authApi.requestOtp).toHaveBeenCalledWith('+77001234567')
    expect(result.current.stage).toBe('phone')
    expect(result.current.rejectedField).toBe('phone')
    expect(result.current.loading).toBe(false)
    expect(notifications.error).toHaveBeenCalledExactlyOnceWith(
      'Пользователь с таким номером не найден.',
    )
    expect(notifications.info).not.toHaveBeenCalled()
    expect(authApi.verifyOtp).not.toHaveBeenCalled()
  })

  it('shows a request error once and stays on the phone step', async () => {
    vi.mocked(authApi.requestOtp).mockRejectedValue(
      new ApiError('Пользователь с таким номером не найден.', 404),
    )
    const { result } = await setup()

    await act(() => result.current.submitPhone('+77001234567'))

    expect(result.current.stage).toBe('phone')
    expect(result.current.rejectedField).toBe('phone')
    expect(result.current.loading).toBe(false)
    expect(notifications.error).toHaveBeenCalledExactlyOnceWith(
      'Пользователь с таким номером не найден.',
    )
  })

  it('advances an existing user to the code step', async () => {
    vi.mocked(authApi.requestOtp).mockResolvedValue({
      user_exists: true,
      detail: 'Код отправлен.',
    })
    const { result } = await setup()

    await act(() => result.current.submitPhone('+77001234567'))

    expect(result.current.stage).toBe('code')
    expect(result.current.phone).toBe('+77001234567')
    expect(notifications.info).not.toHaveBeenCalled()
    expect(notifications.error).not.toHaveBeenCalled()
  })

  it('keeps the code step and shows one toast when verification fails', async () => {
    vi.mocked(authApi.requestOtp).mockResolvedValue({ user_exists: true, detail: 'Код отправлен.' })
    vi.mocked(authApi.verifyOtp).mockRejectedValue(new ApiError('Неверный код.', 400))
    const { result } = await setup()
    await act(() => result.current.submitPhone('+77001234567'))

    await act(() => result.current.submitCode('1111'))

    expect(result.current.stage).toBe('code')
    expect(result.current.rejectedField).toBe('code')
    expect(result.current.loading).toBe(false)
    expect(readTokens()).toBeNull()
    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('Неверный код.')
  })

  it('clears server rejection when the field is edited', async () => {
    vi.mocked(authApi.requestOtp).mockRejectedValue(new ApiError('Не найден.', 404))
    const { result } = await setup()
    await act(() => result.current.submitPhone('+77001234567'))
    expect(result.current.rejectedField).toBe('phone')

    act(() => result.current.clearRejection())
    expect(result.current.rejectedField).toBeNull()
  })

  it('does not mark a valid number as invalid when the server is unavailable', async () => {
    vi.mocked(authApi.requestOtp).mockRejectedValue(new ApiError('Сервер недоступен.', 503))
    const { result } = await setup()

    await act(() => result.current.submitPhone('+77001234567'))

    expect(result.current.rejectedField).toBeNull()
    expect(result.current.stage).toBe('phone')
    expect(notifications.error).toHaveBeenCalledWith('Сервер недоступен.')
  })

  it('clears a rejected code when returning to the phone step', async () => {
    vi.mocked(authApi.requestOtp).mockResolvedValue({ user_exists: true, detail: 'Код отправлен.' })
    vi.mocked(authApi.verifyOtp).mockRejectedValue(new ApiError('Неверный код.', 400))
    const { result } = await setup()
    await act(() => result.current.submitPhone('+77001234567'))
    await act(() => result.current.submitCode('1111'))

    act(() => result.current.backToPhone())

    expect(result.current.rejectedField).toBeNull()
    expect(result.current.stage).toBe('phone')
  })
})
