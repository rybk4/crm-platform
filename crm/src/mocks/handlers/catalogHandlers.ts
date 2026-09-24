import type { Service } from '@/modules/services/types'
import type { Specialist } from '@/modules/specialists/types'
import { db, nextId, refreshDerived } from '../db'
import { organization } from '../fixtures/organization'
import { created, noContent, notFound, ok, route } from '../router'

function branchOf(branchId: number) {
  return db.branches.find((item) => item.id === branchId) ?? db.branches[0]
}

function specialistOf(specialistId: number) {
  return db.specialists.find((item) => item.id === specialistId) ?? db.specialists[0]
}

function toSpecialist(body: Record<string, unknown>, id: number): Specialist {
  const input = body as unknown as Omit<Specialist, 'id'>
  const branch = branchOf(Number(input.branch))

  return {
    ...input,
    id,
    branch: branch.id,
    branch_name: branch.name,
    organization_id: organization.id,
    organization_name: organization.name,
    full_name: `${input.last_name} ${input.first_name} ${input.middle_name ?? ''}`.trim(),
    services_count: 0,
  }
}

function toService(body: Record<string, unknown>, id: number): Service {
  const input = body as unknown as Omit<Service, 'id'>
  const specialist = specialistOf(Number(input.specialist))
  const branch = branchOf(specialist.branch)

  return {
    ...input,
    id,
    specialist: specialist.id,
    specialist_name: specialist.full_name,
    branch_id: branch.id,
    branch_name: branch.name,
    organization_id: organization.id,
    price: String(input.price),
  }
}

export const catalogRoutes = [
  route('get', '/api/organizations/', () => ok([organization])),
  route('get', '/api/branches/', () => ok(db.branches)),

  route('get', '/api/specialists/', () => ok(db.specialists)),
  route('post', '/api/specialists/', ({ body }) => {
    const specialist = toSpecialist(body, nextId(db.specialists))
    db.specialists.push(specialist)
    refreshDerived()
    return created(specialist)
  }),
  route('put', '/api/specialists/:id/', ({ body, params }) => {
    const index = db.specialists.findIndex((item) => item.id === Number(params.id))
    if (index < 0) return notFound()

    db.specialists[index] = toSpecialist(body, Number(params.id))
    refreshDerived()
    return ok(db.specialists[index])
  }),
  route('delete', '/api/specialists/:id/', ({ params }) => {
    const id = Number(params.id)
    db.specialists = db.specialists.filter((item) => item.id !== id)
    db.services = db.services.filter((item) => item.specialist !== id)
    db.appointments = db.appointments.filter((item) => item.specialist !== id)
    refreshDerived()
    return noContent()
  }),

  route('get', '/api/services/', () => ok(db.services)),
  route('post', '/api/services/', ({ body }) => {
    const service = toService(body, nextId(db.services))
    db.services.push(service)
    refreshDerived()
    return created(service)
  }),
  route('put', '/api/services/:id/', ({ body, params }) => {
    const index = db.services.findIndex((item) => item.id === Number(params.id))
    if (index < 0) return notFound()

    db.services[index] = toService(body, Number(params.id))
    refreshDerived()
    return ok(db.services[index])
  }),
  route('delete', '/api/services/:id/', ({ params }) => {
    const id = Number(params.id)
    db.services = db.services.filter((item) => item.id !== id)
    refreshDerived()
    return noContent()
  }),
]
