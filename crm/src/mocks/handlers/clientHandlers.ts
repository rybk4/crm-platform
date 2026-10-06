import type { Client, ClientInput, ClientVisit } from '@/modules/clients/types'
import { sameEntityId, type EntityId } from '@/lib/api/entityId'
import { dayKey } from '@/lib/datetime/day'
import { db, nextId, refreshDerived } from '../db'
import { organization } from '../fixtures/organization'
import { badRequest, created, noContent, notFound, ok, route } from '../router'

function fullName(input: Pick<ClientInput, 'last_name' | 'first_name' | 'middle_name'>) {
  return [input.last_name, input.first_name, input.middle_name].filter(Boolean).join(' ')
}

function toClient(body: Record<string, unknown>, id: number): Client {
  const input = body as unknown as ClientInput
  const existing = db.clients.find((item) => item.id === id)

  return {
    ...input,
    id,
    organization_id: organization.id,
    name: fullName(input),
    segment: existing?.segment ?? 'new',
    visits_count: existing?.visits_count ?? 0,
    total_spent: existing?.total_spent ?? '0',
    average_check: existing?.average_check ?? '0',
    currency: organization.currency,
    first_visit_at: existing?.first_visit_at ?? null,
    last_visit_at: existing?.last_visit_at ?? null,
    recent_visits: existing?.recent_visits ?? [],
    created_at: existing?.created_at ?? new Date().toISOString(),
  }
}

function appointmentsOf(clientId: EntityId) {
  return db.appointments.filter((item) => sameEntityId(item.client, clientId))
}

function visitsOf(clientId: EntityId): ClientVisit[] {
  return appointmentsOf(clientId)
    .sort((left, right) => right.starts_at.localeCompare(left.starts_at))
    .map((item) => ({
      id: item.id,
      starts_at: item.starts_at,
      service_name: item.service_name,
      specialist_name: item.specialist_name,
      duration_minutes: item.duration_minutes,
      price: item.price,
      currency: item.currency,
      status: item.status,
    }))
}

/** Фильтры, для которых нужны записи клиента, — как их считал бы сервер. */
function matchesFilters(client: Client, query: Record<string, string>) {
  if (query.status && client.status !== query.status) return false
  if (!query.service && !query.visit_date) return true

  return appointmentsOf(client.id).some(
    (item) =>
      (!query.service || sameEntityId(item.service, query.service)) &&
      (!query.visit_date || dayKey(new Date(item.starts_at)) === query.visit_date),
  )
}

function validate(body: Record<string, unknown>) {
  return body.first_name && body.phone_number
    ? null
    : badRequest({ first_name: ['Укажите имя и телефон клиента.'] })
}

export const clientRoutes = [
  route('get', '/api/clients/', ({ query }) =>
    ok(db.clients.filter((client) => matchesFilters(client, query))),
  ),

  route('get', '/api/clients/:id/', ({ params }) => {
    const client = db.clients.find((item) => item.id === Number(params.id))
    return client ? ok(client) : notFound()
  }),

  route('get', '/api/clients/:id/visits/', ({ params }) => {
    const client = db.clients.find((item) => item.id === Number(params.id))
    return client ? ok(visitsOf(client.id)) : notFound()
  }),

  route('post', '/api/clients/', ({ body }) => {
    const invalid = validate(body)
    if (invalid) return invalid

    const client = toClient(body, nextId(db.clients))
    db.clients.push(client)
    refreshDerived()
    return created(client)
  }),

  route('put', '/api/clients/:id/', ({ body, params }) => {
    const index = db.clients.findIndex((item) => item.id === Number(params.id))
    if (index < 0) return notFound()
    const invalid = validate(body)
    if (invalid) return invalid

    db.clients[index] = toClient(body, Number(params.id))
    refreshDerived()
    return ok(db.clients[index])
  }),

  route('delete', '/api/clients/:id/', ({ params }) => {
    const id = Number(params.id)
    db.clients = db.clients.filter((item) => item.id !== id)
    db.appointments = db.appointments.filter((item) => item.client !== id)
    refreshDerived()
    return noContent()
  }),
]
