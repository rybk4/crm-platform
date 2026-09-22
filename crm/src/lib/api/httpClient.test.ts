import type { AxiosAdapter, AxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearTokens, readTokens, writeTokens } from '../auth/tokenStorage'
import { resetSessionListeners, subscribeSessionExpired } from '../auth/session'
import { ApiError } from './ApiError'
import { createApiHttp, REFRESH_PATH } from './httpClient'
import { getServerStatus, resetServerStatus } from './serverStatus'

interface StubResponse {
  status: number
  data?: unknown
}

/** Отдаёт ответы по очереди и записывает, с чем ушёл каждый запрос. */
function stubAdapter(responses: StubResponse[]) {
  const calls: AxiosRequestConfig[] = []

  const adapter: AxiosAdapter = (config) => {
    calls.push(config)
    const next = responses.shift() ?? { status: 200, data: {} }

    if (next.status >= 200 && next.status < 300) {
      return Promise.resolve({
        data: next.data ?? {},
        status: next.status,
        statusText: 'OK',
        headers: {},
        config,
      })
    }

    const error = Object.assign(new Error(`stub ${next.status}`), {
      isAxiosError: true,
      config,
      response: { data: next.data ?? {}, status: next.status, statusText: '', headers: {}, config },
    })
    return Promise.reject(error)
  }

  return { adapter, calls }
}

function authHeader(config: AxiosRequestConfig) {
  return new Headers(config.headers as Record<string, string>).get('authorization')
}

beforeEach(() => {
  localStorage.clear()
  resetServerStatus()
  resetSessionListeners()
})

afterEach(() => {
  localStorage.clear()
  resetServerStatus()
  resetSessionListeners()
})

describe('заголовки запроса', () => {
  it('подставляет access-токен и язык', async () => {
    writeTokens({ access: 'access-1', refresh: 'refresh-1' })
    const { adapter, calls } = stubAdapter([{ status: 200, data: { id: 1 } }])

    await createApiHttp({ adapter }).get('/api/users/me/')

    expect(authHeader(calls[0])).toBe('Bearer access-1')
    expect(new Headers(calls[0].headers as Record<string, string>).get('accept-language')).toBe(
      'ru',
    )
  })

  it('не подставляет токен в анонимный запрос', async () => {
    writeTokens({ access: 'access-1', refresh: 'refresh-1' })
    const { adapter, calls } = stubAdapter([{ status: 200 }])

    await createApiHttp({ adapter }).post('/api/auth/otp/request/', {}, { anonymous: true })

    expect(authHeader(calls[0])).toBeNull()
  })
})

describe('обновление токена по 401', () => {
  it('обновляет токен и повторяет запрос', async () => {
    writeTokens({ access: 'stale', refresh: 'refresh-1' })
    const { adapter, calls } = stubAdapter([
      { status: 401, data: { detail: 'expired' } },
      { status: 200, data: { access: 'fresh' } },
      { status: 200, data: { id: 1 } },
    ])

    const response = await createApiHttp({ adapter }).get('/api/users/me/')

    expect(response.data).toEqual({ id: 1 })
    expect(calls.map((call) => call.url)).toEqual([
      '/api/users/me/',
      REFRESH_PATH,
      '/api/users/me/',
    ])
    expect(authHeader(calls[2])).toBe('Bearer fresh')
    expect(readTokens()?.access).toBe('fresh')
  })

  it('обновляет токен один раз на несколько параллельных 401', async () => {
    writeTokens({ access: 'stale', refresh: 'refresh-1' })
    const { adapter, calls } = stubAdapter([
      { status: 401 },
      { status: 401 },
      { status: 200, data: { access: 'fresh' } },
      { status: 200, data: { id: 1 } },
      { status: 200, data: { id: 2 } },
    ])
    const http = createApiHttp({ adapter })

    await Promise.all([http.get('/api/services/'), http.get('/api/specialists/')])

    expect(calls.filter((call) => call.url === REFRESH_PATH)).toHaveLength(1)
  })

  it('чистит токены и сообщает об истёкшей сессии, если рефреш не удался', async () => {
    writeTokens({ access: 'stale', refresh: 'dead' })
    const onExpired = vi.fn()
    subscribeSessionExpired(onExpired)
    const { adapter } = stubAdapter([{ status: 401 }, { status: 401 }])

    await expect(createApiHttp({ adapter }).get('/api/users/me/')).rejects.toBeInstanceOf(ApiError)

    expect(readTokens()).toBeNull()
    expect(onExpired).toHaveBeenCalledOnce()
  })

  it('не повторяет запрос второй раз', async () => {
    writeTokens({ access: 'stale', refresh: 'refresh-1' })
    const { adapter, calls } = stubAdapter([
      { status: 401 },
      { status: 200, data: { access: 'fresh' } },
      { status: 401 },
    ])

    await expect(createApiHttp({ adapter }).get('/api/users/me/')).rejects.toBeInstanceOf(ApiError)

    expect(calls.filter((call) => call.url === '/api/users/me/')).toHaveLength(2)
  })

  it('не пытается обновлять токен без refresh-токена', async () => {
    clearTokens()
    const onExpired = vi.fn()
    subscribeSessionExpired(onExpired)
    const { adapter, calls } = stubAdapter([{ status: 401 }])

    await expect(createApiHttp({ adapter }).get('/api/users/me/')).rejects.toBeInstanceOf(ApiError)

    expect(calls.filter((call) => call.url === REFRESH_PATH)).toHaveLength(0)
    expect(onExpired).toHaveBeenCalledOnce()
  })
})

describe('статус сервера и ошибки', () => {
  it('поднимает недоступность на 503', async () => {
    const { adapter } = stubAdapter([{ status: 503 }])

    await expect(createApiHttp({ adapter }).get('/api/services/')).rejects.toBeInstanceOf(ApiError)
    expect(getServerStatus()).toBe('unavailable')
  })

  it('не считает недоступностью 400', async () => {
    const { adapter } = stubAdapter([{ status: 400, data: { name: ['Обязательное поле.'] } }])

    await expect(createApiHttp({ adapter }).get('/api/services/')).rejects.toMatchObject({
      status: 400,
      messages: ['Обязательное поле.'],
    })
    expect(getServerStatus()).toBe('available')
  })

  it('возвращает доступность после успешного ответа', async () => {
    const { adapter } = stubAdapter([{ status: 502 }, { status: 200, data: [] }])
    const http = createApiHttp({ adapter })

    await expect(http.get('/api/services/')).rejects.toBeInstanceOf(ApiError)
    expect(getServerStatus()).toBe('unavailable')

    await http.get('/api/services/')
    expect(getServerStatus()).toBe('available')
  })
})
