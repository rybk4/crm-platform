import type { Client } from './types'

/** Клиент для тестов модуля: всё заполнено, нужное переопределяется. */
export function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    organization_id: 1,
    name: 'Нурланова Алия',
    last_name: 'Нурланова',
    first_name: 'Алия',
    middle_name: '',
    phone_number: '+77011110001',
    email: 'aliya@example.kz',
    birthday: '1993-04-12',
    gender: 'female',
    status: 'basic',
    discount_percent: null,
    height_cm: null,
    weight_kg: null,
    note: '',
    segment: 'regular',
    visits_count: 3,
    total_spent: '27000',
    average_check: '9000',
    currency: 'KZT',
    first_visit_at: '2026-06-01T09:00:00.000Z',
    last_visit_at: '2026-09-01T09:00:00.000Z',
    recent_visits: [],
    created_at: '2026-03-01T08:00:00.000Z',
    ...overrides,
  }
}
