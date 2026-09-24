import type { TranslationKey } from '@/lib/i18n/messages'
import type { StatusTone } from '@/ui/StatusPill'
import type { Client, ClientInput, ClientSegment } from './types'

interface SegmentMeta {
  tone: StatusTone
  labelKey: TranslationKey
  hintKey: TranslationKey
}

export const segmentMeta: Record<ClientSegment, SegmentMeta> = {
  new: { tone: 'info', labelKey: 'segmentNew', hintKey: 'segmentNewHint' },
  regular: { tone: 'success', labelKey: 'segmentRegular', hintKey: 'segmentRegularHint' },
  vip: { tone: 'warning', labelKey: 'segmentVip', hintKey: 'segmentVipHint' },
  sleeping: { tone: 'neutral', labelKey: 'segmentSleeping', hintKey: 'segmentSleepingHint' },
}

export function emptyClientForm(): ClientInput {
  return { name: '', phone_number: '', email: '', birthday: null, note: '' }
}

export function clientToForm(client: Client): ClientInput {
  return {
    name: client.name,
    phone_number: client.phone_number,
    email: client.email,
    birthday: client.birthday,
    note: client.note,
  }
}

export function isClientFormValid(form: ClientInput) {
  return Boolean(form.name.trim() && form.phone_number.trim())
}

export function clientInitials(client: Client) {
  return client.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

/** Поиск идёт по имени, телефону, почте и заметке — так ищут администраторы. */
export function matchesSearch(client: Client, search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return true

  return `${client.name} ${client.phone_number} ${client.email} ${client.note}`
    .toLowerCase()
    .includes(query)
}

export function filterClients(
  clients: readonly Client[],
  search: string,
  segment: ClientSegment | null,
) {
  return clients
    .filter((client) => matchesSearch(client, search))
    .filter((client) => (segment ? client.segment === segment : true))
}

export interface ClientTotals {
  clients: number
  visits: number
  revenue: number
}

export function clientTotals(clients: readonly Client[]): ClientTotals {
  return {
    clients: clients.length,
    visits: clients.reduce((sum, client) => sum + client.visits_count, 0),
    revenue: clients.reduce((sum, client) => sum + Number(client.total_spent), 0),
  }
}
