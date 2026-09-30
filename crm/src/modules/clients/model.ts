import type { TranslationKey } from '@/lib/i18n/messages'
import { formatPhoneInput, isValidPhone, normalizePhone } from '@/lib/validation/phone'
import type { StatusTone } from '@/ui/StatusPill'
import type { Client, ClientGender, ClientInput, ClientStatus } from './types'

export const statusLabelKeys: Record<ClientStatus, TranslationKey> = {
  basic: 'clientStatusBasic',
  vip: 'clientStatusVip',
  blocked: 'clientStatusBlocked',
}

/* ---------- Форма ---------- */

/** Состояние полей: числа — строками, как их вводят; телефон — в маске. */
export interface ClientForm {
  last_name: string
  first_name: string
  middle_name: string
  phone_number: string
  email: string
  birthday: string
  gender: ClientGender | ''
  status: ClientStatus
  discount_percent: string
  height_cm: string
  weight_kg: string
  note: string
}

export type ClientFormField = keyof ClientForm

export type ClientFormErrors = Partial<Record<ClientFormField, TranslationKey>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emptyClientForm(): ClientForm {
  return {
    last_name: '',
    first_name: '',
    middle_name: '',
    phone_number: formatPhoneInput(''),
    email: '',
    birthday: '',
    gender: '',
    status: 'basic',
    discount_percent: '',
    height_cm: '',
    weight_kg: '',
    note: '',
  }
}

function numberText(value: number | null) {
  return value === null ? '' : String(value)
}

function textNumber(value: string) {
  return value.trim() ? Number(value.replace(',', '.')) : null
}

export function clientToForm(client: Client): ClientForm {
  return {
    last_name: client.last_name,
    first_name: client.first_name,
    middle_name: client.middle_name,
    phone_number: formatPhoneInput(client.phone_number),
    email: client.email,
    birthday: client.birthday ?? '',
    gender: client.gender ?? '',
    status: client.status,
    discount_percent: numberText(client.discount_percent),
    height_cm: numberText(client.height_cm),
    weight_kg: numberText(client.weight_kg),
    note: client.note,
  }
}

export function formToClientInput(form: ClientForm): ClientInput {
  return {
    last_name: form.last_name.trim(),
    first_name: form.first_name.trim(),
    middle_name: form.middle_name.trim(),
    phone_number: normalizePhone(form.phone_number),
    email: form.email.trim(),
    birthday: form.birthday || null,
    gender: form.gender || null,
    status: form.status,
    discount_percent: textNumber(form.discount_percent),
    height_cm: textNumber(form.height_cm),
    weight_kg: textNumber(form.weight_kg),
    note: form.note.trim(),
  }
}

function isPositive(value: number | null) {
  return value === null || (Number.isFinite(value) && value > 0)
}

export function validateClientForm(form: ClientForm): ClientFormErrors {
  const input = formToClientInput(form)
  const errors: ClientFormErrors = {}
  const discount = input.discount_percent

  if (!input.first_name) errors.first_name = 'clientErrorRequired'
  if (input.phone_number === '+7') errors.phone_number = 'clientErrorRequired'
  else if (!isValidPhone(input.phone_number)) errors.phone_number = 'errorPhoneFormat'
  if (input.email && !emailPattern.test(input.email)) errors.email = 'clientErrorEmail'
  if (discount !== null && !(Number.isFinite(discount) && discount >= 0 && discount <= 100)) {
    errors.discount_percent = 'clientErrorDiscount'
  }
  if (!isPositive(input.height_cm)) errors.height_cm = 'clientErrorPositive'
  if (!isPositive(input.weight_kg)) errors.weight_kg = 'clientErrorPositive'

  return errors
}

export function isClientFormDirty(form: ClientForm, initial: ClientForm) {
  return JSON.stringify(formToClientInput(form)) !== JSON.stringify(formToClientInput(initial))
}

/* ---------- Список ---------- */

export const clientSorts = ['none', 'name', 'created'] as const

export type ClientSort = (typeof clientSorts)[number]

export const CLIENTS_PAGE_SIZE = 9

export function clientInitials(client: Pick<Client, 'name' | 'last_name' | 'first_name'>) {
  const fromParts = `${client.last_name[0] ?? ''}${client.first_name[0] ?? ''}`
  const fromName = client.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')

  return (fromParts || fromName).toUpperCase()
}

/** Поиск идёт по имени, телефону, почте и заметке — так ищут администраторы. */
export function matchesSearch(client: Client, search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return true

  return `${client.name} ${client.phone_number} ${client.email} ${client.note}`
    .toLowerCase()
    .includes(query)
}

export function arrangeClients(clients: readonly Client[], search: string, sort: ClientSort) {
  const found = clients.filter((client) => matchesSearch(client, search))
  if (sort === 'name') return [...found].sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'created') return [...found].sort((a, b) => b.created_at.localeCompare(a.created_at))
  return found
}

export function pageCount(total: number, pageSize = CLIENTS_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize))
}

export function pageItems<T>(items: readonly T[], page: number, pageSize = CLIENTS_PAGE_SIZE) {
  return items.slice((page - 1) * pageSize, page * pageSize)
}

export interface ClientBadge {
  labelKey: TranslationKey
  tone: StatusTone
}

/** Новичка отмечаем в первую очередь, иначе — ручной статус; «Базовый» не показываем. */
export function clientBadge(client: Client): ClientBadge | null {
  if (client.segment === 'new') return { labelKey: 'clientBadgeNew', tone: 'info' }
  if (client.status === 'vip') return { labelKey: 'clientStatusVip', tone: 'warning' }
  if (client.status === 'blocked') return { labelKey: 'clientStatusBlocked', tone: 'danger' }
  return null
}

export function recentVisitsByDate(client: Client) {
  return [...client.recent_visits].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
}

/** Услуги из последних записей: без повторов, по алфавиту; лишние уходят в «+N». */
export function clientServiceChips(client: Client, limit = 3) {
  const names = [...new Set(client.recent_visits.map((visit) => visit.service_name))].sort((a, b) =>
    a.localeCompare(b),
  )
  return { visible: names.slice(0, limit), hidden: names.slice(limit) }
}
