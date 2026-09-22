import { describe, expect, it } from 'vitest'

import { parseApiErrors } from './errors'

describe('parseApiErrors', () => {
  it('собирает сообщения из вложенных полей DRF', () => {
    expect(parseApiErrors({ phone_number: ['Неверный формат.'], detail: 'Ошибка.' })).toEqual([
      'Неверный формат.',
      'Ошибка.',
    ])
  })

  it('не дублирует одинаковые сообщения', () => {
    expect(parseApiErrors({ a: 'Повтор.', b: ['Повтор.'] })).toEqual(['Повтор.'])
  })

  it('игнорирует пустые строки и не-строковые значения', () => {
    expect(parseApiErrors({ a: '  ', b: 42, c: null })).toEqual([])
  })

  it('выдерживает циклическую структуру', () => {
    const payload: Record<string, unknown> = { detail: 'Ошибка.' }
    payload.self = payload
    expect(parseApiErrors(payload)).toEqual(['Ошибка.'])
  })
})
