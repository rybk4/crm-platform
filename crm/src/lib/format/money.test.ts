import { describe, expect, it } from 'vitest'

import { formatMoney } from './money'

describe('formatMoney', () => {
  it('добавляет валюту к числу', () => {
    expect(formatMoney(9000, 'KZT')).toContain('KZT')
    expect(formatMoney('9000', 'KZT')).toContain('9')
  })

  it('возвращает нечисловое значение как есть', () => {
    expect(formatMoney('по договорённости', 'KZT')).toBe('по договорённости KZT')
  })

  it('не превращает пустую строку в NaN', () => {
    expect(formatMoney('', 'KZT')).toBe(' KZT')
  })

  it('принимает ноль как число', () => {
    expect(formatMoney(0, 'KZT')).toBe('0 KZT')
  })
})
