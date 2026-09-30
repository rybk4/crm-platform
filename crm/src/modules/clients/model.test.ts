import { describe, expect, it } from 'vitest'

import {
  arrangeClients,
  clientBadge,
  clientInitials,
  clientServiceChips,
  clientToForm,
  emptyClientForm,
  formToClientInput,
  isClientFormDirty,
  pageCount,
  pageItems,
  recentVisitsByDate,
  validateClientForm,
} from './model'
import { makeClient } from './testClient'

const visit = (id: number, starts_at: string, service_name: string) => ({
  id,
  starts_at,
  service_name,
  status: 'completed' as const,
})

describe('clientToForm / formToClientInput', () => {
  it('переводит числа в строки и телефон в маску, а обратно — нормализует', () => {
    const client = makeClient({ discount_percent: 10, height_cm: 170 })
    const form = clientToForm(client)

    expect(form.phone_number).toBe('+7 (701) 111-00-01')
    expect(form.discount_percent).toBe('10')

    const input = formToClientInput({ ...form, first_name: ' Алия ', weight_kg: '55,5' })
    expect(input).toMatchObject({
      first_name: 'Алия',
      phone_number: '+77011110001',
      discount_percent: 10,
      height_cm: 170,
      weight_kg: 55.5,
    })
  })

  it('пустые поля превращает в null', () => {
    const input = formToClientInput(emptyClientForm())

    expect(input.birthday).toBeNull()
    expect(input.gender).toBeNull()
    expect(input.discount_percent).toBeNull()
  })
})

describe('validateClientForm', () => {
  it('требует имя и телефон', () => {
    expect(validateClientForm(emptyClientForm())).toEqual({
      first_name: 'clientErrorRequired',
      phone_number: 'clientErrorRequired',
    })
  })

  it('проверяет формат телефона, почты, скидку и положительные числа', () => {
    const form = {
      ...clientToForm(makeClient()),
      phone_number: '+7 (701) 11',
      email: 'bad',
      discount_percent: '120',
      height_cm: '-5',
      weight_kg: 'abc',
    }

    expect(validateClientForm(form)).toEqual({
      phone_number: 'errorPhoneFormat',
      email: 'clientErrorEmail',
      discount_percent: 'clientErrorDiscount',
      height_cm: 'clientErrorPositive',
      weight_kg: 'clientErrorPositive',
    })
  })

  it('пропускает корректную форму', () => {
    expect(validateClientForm(clientToForm(makeClient({ discount_percent: 0 })))).toEqual({})
  })
})

describe('isClientFormDirty', () => {
  it('не считает правкой пробелы по краям', () => {
    const initial = clientToForm(makeClient())

    expect(isClientFormDirty({ ...initial, first_name: ' Алия ' }, initial)).toBe(false)
    expect(isClientFormDirty({ ...initial, status: 'vip' }, initial)).toBe(true)
  })
})

describe('clientInitials', () => {
  it('берёт первые буквы фамилии и имени', () => {
    expect(clientInitials(makeClient())).toBe('НА')
  })

  it('без частей имени падает на полное имя', () => {
    expect(clientInitials({ name: 'сергей ким', last_name: '', first_name: '' })).toBe('СК')
  })
})

describe('arrangeClients', () => {
  const clients = [
    makeClient({ id: 1, name: 'Ким Сергей', created_at: '2026-03-01T00:00:00Z' }),
    makeClient({
      id: 2,
      name: 'Абаева Дана',
      phone_number: '+77010000002',
      created_at: '2026-05-01T00:00:00Z',
    }),
  ]

  it('ищет по имени и телефону', () => {
    expect(arrangeClients(clients, 'ким', 'none').map((item) => item.id)).toEqual([1])
    expect(arrangeClients(clients, '0000002', 'none').map((item) => item.id)).toEqual([2])
  })

  it('сортирует по алфавиту и по дате добавления', () => {
    expect(arrangeClients(clients, '', 'name').map((item) => item.id)).toEqual([2, 1])
    expect(arrangeClients(clients, '', 'created').map((item) => item.id)).toEqual([2, 1])
    expect(arrangeClients(clients, '', 'none').map((item) => item.id)).toEqual([1, 2])
  })
})

describe('pagination', () => {
  it('считает страницы и режет список', () => {
    const items = Array.from({ length: 20 }, (_, index) => index)

    expect(pageCount(20)).toBe(3)
    expect(pageCount(0)).toBe(1)
    expect(pageItems(items, 3)).toEqual([18, 19])
  })
})

describe('clientBadge', () => {
  it('новичок важнее статуса, базовый не показываем', () => {
    expect(clientBadge(makeClient({ segment: 'new', status: 'vip' }))?.labelKey).toBe(
      'clientBadgeNew',
    )
    expect(clientBadge(makeClient({ status: 'vip' }))?.tone).toBe('warning')
    expect(clientBadge(makeClient({ status: 'blocked' }))?.tone).toBe('danger')
    expect(clientBadge(makeClient())).toBeNull()
  })
})

describe('последние записи на карточке', () => {
  const client = makeClient({
    recent_visits: [
      visit(1, '2026-09-10T10:00:00Z', 'Маникюр'),
      visit(2, '2026-09-01T10:00:00Z', 'Стрижка'),
      visit(3, '2026-08-20T10:00:00Z', 'Маникюр'),
      visit(4, '2026-08-10T10:00:00Z', 'Брови'),
      visit(5, '2026-08-01T10:00:00Z', 'Укладка'),
    ],
  })

  it('упорядочивает записи по дате', () => {
    expect(recentVisitsByDate(client).map((item) => item.id)).toEqual([5, 4, 3, 2, 1])
  })

  it('убирает повторы услуг и прячет лишние в «+N»', () => {
    expect(clientServiceChips(client)).toEqual({
      visible: ['Брови', 'Маникюр', 'Стрижка'],
      hidden: ['Укладка'],
    })
  })
})
