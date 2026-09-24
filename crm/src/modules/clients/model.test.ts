import { describe, expect, it } from 'vitest'

import {
  clientInitials,
  clientToForm,
  clientTotals,
  emptyClientForm,
  filterClients,
  isClientFormValid,
  matchesSearch,
} from './model'
import type { Client } from './types'

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    organization_id: 1,
    name: 'Алия Нурланова',
    phone_number: '+77011110001',
    email: 'aliya@example.kz',
    birthday: '1993-04-12',
    note: 'Аллергия на ацетон',
    segment: 'regular',
    visits_count: 4,
    total_spent: '36000',
    average_check: '9000',
    currency: 'KZT',
    first_visit_at: '2026-06-02T09:00:00.000Z',
    last_visit_at: '2026-09-01T09:00:00.000Z',
    created_at: '2026-03-01T08:00:00.000Z',
    ...overrides,
  }
}

describe('форма клиента', () => {
  it('требует имя и телефон', () => {
    expect(isClientFormValid(emptyClientForm())).toBe(false)
    expect(isClientFormValid({ ...emptyClientForm(), name: 'Иван' })).toBe(false)
    expect(
      isClientFormValid({ ...emptyClientForm(), name: 'Иван', phone_number: '+77010000000' }),
    ).toBe(true)
  })

  it('не принимает строки из пробелов', () => {
    expect(isClientFormValid({ ...emptyClientForm(), name: '  ', phone_number: '  ' })).toBe(false)
  })

  it('переносит клиента в форму без агрегатов', () => {
    expect(clientToForm(makeClient())).toEqual({
      name: 'Алия Нурланова',
      phone_number: '+77011110001',
      email: 'aliya@example.kz',
      birthday: '1993-04-12',
      note: 'Аллергия на ацетон',
    })
  })

  it('берёт инициалы из двух первых слов', () => {
    expect(clientInitials(makeClient())).toBe('АН')
    expect(clientInitials(makeClient({ name: 'Ким' }))).toBe('К')
  })
})

describe('поиск и фильтры', () => {
  it('ищет по имени, телефону и заметке без учёта регистра', () => {
    const client = makeClient()

    expect(matchesSearch(client, 'алия')).toBe(true)
    expect(matchesSearch(client, '7701111')).toBe(true)
    expect(matchesSearch(client, 'ацетон')).toBe(true)
    expect(matchesSearch(client, 'стрижка')).toBe(false)
  })

  it('считает пустой запрос совпадением', () => {
    expect(matchesSearch(makeClient(), '   ')).toBe(true)
  })

  it('фильтрует по сегменту вместе с поиском', () => {
    const clients = [makeClient(), makeClient({ id: 2, name: 'Сергей Ким', segment: 'vip' })]

    expect(filterClients(clients, '', 'vip')).toHaveLength(1)
    expect(filterClients(clients, 'сергей', null)[0].id).toBe(2)
    expect(filterClients(clients, 'сергей', 'regular')).toHaveLength(0)
  })
})

describe('clientTotals', () => {
  it('складывает визиты и суммы', () => {
    const totals = clientTotals([
      makeClient(),
      makeClient({ id: 2, visits_count: 1, total_spent: '9000' }),
    ])

    expect(totals).toEqual({ clients: 2, visits: 5, revenue: 45000 })
  })

  it('возвращает нули на пустом списке', () => {
    expect(clientTotals([])).toEqual({ clients: 0, visits: 0, revenue: 0 })
  })
})
