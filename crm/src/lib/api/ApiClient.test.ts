import type { AxiosAdapter, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { describe, expect, it } from 'vitest'

import { ApiClient } from './ApiClient'

function collectingInstance(): { http: AxiosInstance; calls: AxiosRequestConfig[] } {
  const calls: AxiosRequestConfig[] = []
  const adapter: AxiosAdapter = (config) => {
    calls.push(config)
    return Promise.resolve({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
  }
  return { http: axios.create({ adapter }), calls }
}

class ThingsApi extends ApiClient {
  constructor(http: AxiosInstance) {
    super('/api/things/', http)
  }

  list() {
    return this.get<unknown>()
  }

  one(id: number) {
    return this.get<unknown>(`${id}/`)
  }

  create(input: unknown) {
    return this.post<unknown>('', input)
  }

  replace(id: number, input: unknown) {
    return this.put<unknown>(`${id}/`, input)
  }

  touch(id: number, input: unknown) {
    return this.patch<unknown>(`${id}/`, input)
  }

  remove(id: number) {
    return this.delete(`${id}/`)
  }
}

describe('ApiClient', () => {
  it('отдаёт данные ответа, а не объект axios', async () => {
    const { http } = collectingInstance()

    await expect(new ThingsApi(http).list()).resolves.toEqual({ ok: true })
  })

  it('без пути обращается к базовому адресу', async () => {
    const { http, calls } = collectingInstance()

    await new ThingsApi(http).list()

    expect(calls[0].url).toBe('/api/things/')
  })

  it('склеивает путь без двойного слеша', async () => {
    const { http, calls } = collectingInstance()

    await new ThingsApi(http).one(5)

    expect(calls[0].url).toBe('/api/things/5/')
  })

  it('отправляет тело и метод для каждой операции', async () => {
    const { http, calls } = collectingInstance()
    const api = new ThingsApi(http)

    await api.create({ name: 'a' })
    await api.replace(5, { name: 'b' })
    await api.touch(5, { name: 'c' })
    await api.remove(5)

    expect(calls.map((call) => call.method)).toEqual(['post', 'put', 'patch', 'delete'])
    // axios сериализует тело до адаптера, поэтому сравниваем разобранный JSON.
    expect(JSON.parse(String(calls[0].data))).toEqual({ name: 'a' })
    expect(calls[1].url).toBe('/api/things/5/')
  })
})
