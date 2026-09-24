import type { Client, ClientVisit } from '@/modules/clients/types'
import { db, nextId, refreshDerived } from '../db'
import { organization } from '../fixtures/organization'
import { badRequest, created, noContent, notFound, ok, route } from '../router'

function matchesSearch(client: Client, search: string) {
  const haystack = `${client.name} ${client.phone_number} ${client.email} ${client.note}`
  return haystack.toLowerCase().includes(search.toLowerCase())
}

function toClient(body: Record<string, unknown>, id: number): Client {
  const existing = db.clients.find((item) => item.id === id)

  return {
    id,
    organization_id: organization.id,
    name: String(body.name ?? ''),
    phone_number: String(body.phone_number ?? ''),
    email: String(body.email ?? ''),
    birthday: typeof body.birthday === 'string' && body.birthday ? body.birthday : null,
    note: String(body.note ?? ''),
    segment: existing?.segment ?? 'new',
    visits_count: existing?.visits_count ?? 0,
    total_spent: existing?.total_spent ?? '0',
    average_check: existing?.average_check ?? '0',
    currency: organization.currency,
    first_visit_at: existing?.first_visit_at ?? null,
    last_visit_at: existing?.last_visit_at ?? null,
    created_at: existing?.created_at ?? new Date().toISOString(),
  }
}

function visitsOf(clientId: number): ClientVisit[] {
  return db.appointments
    .filter((item) => item.client === clientId)
    .sort((left, right) => right.starts_at.localeCompare(left.starts_at))
    .map((item) => ({
      id: item.id,
      starts_at: item.starts_at,
      service_name: item.service_name,
      specialist_name: item.specialist_name,
      price: item.price,
      currency: item.currency,
      status: item.status,
    }))
}

export const clientRoutes = [
  route('get', '/api/clients/', ({ query }) =>
    ok(
      db.clients
        .filter((client) => (query.search ? matchesSearch(client, query.search) : true))
        .filter((client) => (query.segment ? client.segment === query.segment : true))
        .sort((left, right) => left.name.localeCompare(right.name)),
    ),
  ),

  route('get', '/api/clients/:id/visits/', ({ params }) => {
    const client = db.clients.find((item) => item.id === Number(params.id))
    return client ? ok(visitsOf(client.id)) : notFound()
  }),

  route('post', '/api/clients/', ({ body }) => {
    if (!body.name || !body.phone_number) {
      return badRequest({ name: ['Укажите имя и телефон клиента.'] })
    }

    const client = toClient(body, nextId(db.clients))
    db.clients.push(client)
    refreshDerived()
    return created(client)
  }),

  route('put', '/api/clients/:id/', ({ body, params }) => {
    const index = db.clients.findIndex((item) => item.id === Number(params.id))
    if (index < 0) return notFound()

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
