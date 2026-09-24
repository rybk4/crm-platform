import type { TransportResponse } from '@/lib/api/transport'
import type { Appointment, AppointmentStatus } from '@/modules/journal/types'
import { dayKey } from '@/lib/datetime/day'
import { db, nextId, refreshDerived } from '../db'
import { badRequest, created, noContent, notFound, ok, route } from '../router'

function overlaps(candidate: Appointment) {
  return db.appointments.some((item) => {
    if (item.id === candidate.id || item.specialist !== candidate.specialist) return false
    if (item.status === 'cancelled') return false

    return (
      new Date(candidate.starts_at) < new Date(item.ends_at) &&
      new Date(candidate.ends_at) > new Date(item.starts_at)
    )
  })
}

function buildAppointment(body: Record<string, unknown>, id: number): Appointment | null {
  const specialist = db.specialists.find((item) => item.id === Number(body.specialist))
  const service = db.services.find((item) => item.id === Number(body.service))
  const client = db.clients.find((item) => item.id === Number(body.client))
  if (!specialist || !service || !client || typeof body.starts_at !== 'string') return null

  const startsAt = new Date(body.starts_at)
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60000)
  const existing = db.appointments.find((item) => item.id === id)

  return {
    id,
    branch: specialist.branch,
    branch_name: specialist.branch_name,
    specialist: specialist.id,
    specialist_name: specialist.full_name,
    service: service.id,
    service_name: service.name,
    client: client.id,
    client_name: client.name,
    client_phone: client.phone_number,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    duration_minutes: service.duration_minutes,
    price: service.price,
    currency: service.currency,
    status: (body.status as AppointmentStatus | undefined) ?? 'pending',
    source: existing?.source ?? 'crm',
    comment: typeof body.comment === 'string' ? body.comment : '',
    created_at: existing?.created_at ?? new Date().toISOString(),
  }
}

function filtered(query: Record<string, string>) {
  return db.appointments
    .filter((item) => (query.date ? dayKey(new Date(item.starts_at)) === query.date : true))
    .filter((item) => (query.specialist ? item.specialist === Number(query.specialist) : true))
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => (query.client ? item.client === Number(query.client) : true))
    .sort((left, right) => left.starts_at.localeCompare(right.starts_at))
}

type SaveResult = { error: TransportResponse } | { appointment: Appointment }

function save(body: Record<string, unknown>, id: number): SaveResult {
  const appointment = buildAppointment(body, id)

  if (!appointment) {
    return { error: badRequest({ detail: ['Не удалось собрать запись по переданным данным.'] }) }
  }

  if (overlaps(appointment)) {
    return { error: badRequest({ starts_at: ['В это время у специалиста уже есть запись.'] }) }
  }

  return { appointment }
}

export const appointmentRoutes = [
  route('get', '/api/appointments/', ({ query }) => ok(filtered(query))),

  route('post', '/api/appointments/', ({ body }) => {
    const result = save(body, nextId(db.appointments))
    if ('error' in result) return result.error

    db.appointments.push(result.appointment)
    refreshDerived()
    return created(result.appointment)
  }),

  route('put', '/api/appointments/:id/', ({ body, params }) => {
    const id = Number(params.id)
    const index = db.appointments.findIndex((item) => item.id === id)
    if (index < 0) return notFound()

    const result = save(body, id)
    if ('error' in result) return result.error

    db.appointments[index] = result.appointment
    refreshDerived()
    return ok(result.appointment)
  }),

  route('patch', '/api/appointments/:id/', ({ body, params }) => {
    const appointment = db.appointments.find((item) => item.id === Number(params.id))
    if (!appointment) return notFound()

    if (typeof body.status === 'string') appointment.status = body.status as AppointmentStatus
    if (typeof body.comment === 'string') appointment.comment = body.comment

    refreshDerived()
    return ok(appointment)
  }),

  route('delete', '/api/appointments/:id/', ({ params }) => {
    db.appointments = db.appointments.filter((item) => item.id !== Number(params.id))
    refreshDerived()
    return noContent()
  }),
]
