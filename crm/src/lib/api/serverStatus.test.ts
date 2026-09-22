import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  checkServerHealth,
  getServerStatus,
  isServerUnavailableStatus,
  reportServerAvailable,
  reportServerUnavailable,
  resetServerStatus,
  subscribeServerStatus,
} from './serverStatus'

afterEach(() => {
  resetServerStatus()
  vi.unstubAllGlobals()
})

describe('isServerUnavailableStatus', () => {
  it('считает недоступностью сетевую ошибку и 5xx шлюза', () => {
    expect(isServerUnavailableStatus(0)).toBe(true)
    expect(isServerUnavailableStatus(502)).toBe(true)
    expect(isServerUnavailableStatus(503)).toBe(true)
    expect(isServerUnavailableStatus(504)).toBe(true)
  })

  it('не считает недоступностью ошибки приложения', () => {
    expect(isServerUnavailableStatus(400)).toBe(false)
    expect(isServerUnavailableStatus(401)).toBe(false)
    expect(isServerUnavailableStatus(500)).toBe(false)
  })
})

describe('подписка на статус', () => {
  it('сообщает подписчикам о смене статуса', () => {
    const listener = vi.fn()
    subscribeServerStatus(listener)

    reportServerUnavailable()
    reportServerAvailable()

    expect(listener).toHaveBeenNthCalledWith(1, 'unavailable')
    expect(listener).toHaveBeenNthCalledWith(2, 'available')
  })

  it('не дёргает подписчиков, если статус не изменился', () => {
    const listener = vi.fn()
    subscribeServerStatus(listener)

    reportServerUnavailable()
    reportServerUnavailable()

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('перестаёт уведомлять после отписки', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeServerStatus(listener)

    unsubscribe()
    reportServerUnavailable()

    expect(listener).not.toHaveBeenCalled()
    expect(getServerStatus()).toBe('unavailable')
  })
})

describe('checkServerHealth', () => {
  it('возвращает true, когда health отвечает 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    await expect(checkServerHealth()).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      '/api/health/',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('возвращает false на 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(checkServerHealth()).resolves.toBe(false)
  })

  it('возвращает false и не бросает при сетевой ошибке', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(checkServerHealth()).resolves.toBe(false)
  })
})
