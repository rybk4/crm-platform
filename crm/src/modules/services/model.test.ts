import { describe, expect, it } from 'vitest'

import {
  emptyServiceForm,
  filterBySpecialist,
  formatPrice,
  isServiceFormValid,
  serviceToForm,
} from './model'
import type { Service } from './types'

function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: 1,
    specialist: 10,
    specialist_name: 'Серик Айдана',
    branch_id: 2,
    branch_name: 'Центр',
    organization_id: 3,
    name: 'Стрижка',
    description: '',
    duration_minutes: 60,
    price: '12000',
    currency: 'KZT',
    is_active: true,
    ...overrides,
  }
}

describe('emptyServiceForm', () => {
  it('ставит час длительности и первую валюту', () => {
    expect(emptyServiceForm(10)).toMatchObject({
      specialist: 10,
      duration_minutes: 60,
      currency: 'KZT',
      is_active: true,
    })
  })
})

describe('serviceToForm', () => {
  it('берёт только редактируемые поля, без серверных', () => {
    const form = serviceToForm(makeService())

    expect(form).toEqual({
      specialist: 10,
      name: 'Стрижка',
      description: '',
      duration_minutes: 60,
      price: '12000',
      currency: 'KZT',
      is_active: true,
    })
  })
})

describe('isServiceFormValid', () => {
  it('требует специалиста, название, длительность и цену', () => {
    const base = emptyServiceForm(10)

    expect(isServiceFormValid(base)).toBe(false)
    expect(isServiceFormValid({ ...base, name: 'Стрижка' })).toBe(false)
    expect(isServiceFormValid({ ...base, name: 'Стрижка', price: '12000' })).toBe(true)
  })

  it('не принимает нулевую длительность', () => {
    const base = emptyServiceForm(10)

    expect(
      isServiceFormValid({ ...base, name: 'Стрижка', price: '12000', duration_minutes: 0 }),
    ).toBe(false)
  })
})

describe('formatPrice', () => {
  it('форматирует число и добавляет валюту', () => {
    expect(formatPrice('12000', 'KZT')).toContain('KZT')
    expect(formatPrice('12000', 'KZT')).toMatch(/12.?000/)
  })

  it('нечисловую цену показывает как есть, а не как NaN', () => {
    expect(formatPrice('договорная', 'KZT')).toBe('договорная KZT')
  })

  it('пустую цену не превращает в ноль', () => {
    expect(formatPrice('', 'KZT')).toBe(' KZT')
  })
})

describe('filterBySpecialist', () => {
  const services = [makeService({ id: 1, specialist: 10 }), makeService({ id: 2, specialist: 20 })]

  it('без фильтра возвращает всё', () => {
    expect(filterBySpecialist(services, '')).toHaveLength(2)
  })

  it('фильтрует по идентификатору специалиста', () => {
    expect(filterBySpecialist(services, '20').map((item) => item.id)).toEqual([2])
  })
})
