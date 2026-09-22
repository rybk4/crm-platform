import { describe, expect, it } from 'vitest'

import { ApiError } from './ApiError'
import { apiErrorMessage } from './apiErrorMessage'

describe('apiErrorMessage', () => {
  it('берёт сообщение бэкенда из ApiError', () => {
    expect(apiErrorMessage(new ApiError('Филиал не найден.', 404), 'запасной')).toBe(
      'Филиал не найден.',
    )
  })

  it('на прочих ошибках отдаёт запасной текст', () => {
    expect(apiErrorMessage(new TypeError('boom'), 'запасной')).toBe('запасной')
    expect(apiErrorMessage('строка', 'запасной')).toBe('запасной')
    expect(apiErrorMessage(null, 'запасной')).toBe('запасной')
  })
})

describe('ApiError', () => {
  it('различает отказ авторизации и недоступность сервера', () => {
    expect(new ApiError('x', 401).isUnauthorized).toBe(true)
    expect(new ApiError('x', 503).isServerUnavailable).toBe(true)
    expect(new ApiError('x', 0).isServerUnavailable).toBe(true)
    expect(new ApiError('x', 500).isServerUnavailable).toBe(false)
  })
})
