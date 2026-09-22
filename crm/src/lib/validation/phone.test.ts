import { describe, expect, it } from 'vitest'

import { formatPhoneInput, isValidPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it('переводит российский формат с 8 в международный', () => {
    expect(normalizePhone('8 705 123 45 67')).toBe('+77051234567')
  })

  it('добавляет плюс к номеру, начинающемуся с 7', () => {
    expect(normalizePhone('7 705 123 45 67')).toBe('+77051234567')
  })

  it('убирает разделители и сохраняет плюс', () => {
    expect(normalizePhone(' +7 (705) 123-45-67 ')).toBe('+77051234567')
  })
})

describe('isValidPhone', () => {
  it('принимает международный номер', () => {
    expect(isValidPhone('+77051234567')).toBe(true)
  })

  it('отклоняет номер без плюса и слишком короткий', () => {
    expect(isValidPhone('77051234567')).toBe(false)
    expect(isValidPhone('+7705')).toBe(false)
  })
})

describe('formatPhoneInput', () => {
  it('раскладывает цифры в маску', () => {
    expect(formatPhoneInput('77051234567')).toBe('+7 (705) 123-45-67')
  })

  it('не падает на пустом вводе', () => {
    expect(formatPhoneInput('')).toBe('+7')
  })
})
