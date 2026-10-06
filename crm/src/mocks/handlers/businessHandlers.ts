import type { Campaign, CampaignInput } from '@/modules/campaigns/types'
import type { Bill, BillInput, PaymentMethod, PaymentMethodInput } from '@/modules/finance/types'
import type { LoyaltyProgram, LoyaltyProgramInput } from '@/modules/loyalty/types'
import { db, refreshDerived } from '../db'
import { created, noContent, notFound, ok, route } from '../router'

let bills: Bill[] = []
let methods: PaymentMethod[] = []
let programs: LoyaltyProgram[] = []
let campaigns: Campaign[] = []
let id = 100
const stamp = () => new Date().toISOString()

export const businessRoutes = [
  route('get', '/api/bills/', () => ok(bills)),
  route('post', '/api/bills/', ({ body }) => {
    const item = {
      ...(body as unknown as BillInput),
      id: ++id,
      create_date: stamp(),
      update_date: stamp(),
    }
    bills.push(item)
    return created(item)
  }),
  route('put', '/api/bills/:id/', ({ body, params }) => {
    const index = bills.findIndex((item) => String(item.id) === params.id)
    if (index < 0) return notFound()
    bills[index] = { ...bills[index], ...(body as unknown as BillInput), update_date: stamp() }
    return ok(bills[index])
  }),
  route('delete', '/api/bills/:id/', ({ params }) => {
    bills = bills.filter((item) => String(item.id) !== params.id)
    return noContent()
  }),
  route('get', '/api/payment-methods/', () => ok(methods)),
  route('post', '/api/payment-methods/', ({ body }) => {
    const item = {
      ...(body as unknown as PaymentMethodInput),
      id: ++id,
      create_date: stamp(),
      update_date: stamp(),
    }
    methods.push(item)
    return created(item)
  }),
  route('put', '/api/payment-methods/:id/', ({ body, params }) => {
    const index = methods.findIndex((item) => String(item.id) === params.id)
    if (index < 0) return notFound()
    methods[index] = {
      ...methods[index],
      ...(body as unknown as PaymentMethodInput),
      update_date: stamp(),
    }
    return ok(methods[index])
  }),
  route('delete', '/api/payment-methods/:id/', ({ params }) => {
    methods = methods.filter((item) => String(item.id) !== params.id)
    return noContent()
  }),
  route('patch', '/api/deals/:id/close/', ({ body, params }) => {
    const appointment = db.appointments.find((item) => String(item.deal) === params.id)
    const method = methods.find((item) => String(item.id) === String(body.payment_method))
    if (!appointment || !method) return notFound()
    appointment.deal_status = 'paid'
    appointment.deal_payment_method = method.id
    appointment.deal_discount = String(body.discount ?? '0')
    appointment.status = 'completed'
    refreshDerived()
    return ok({ id: params.id, status: 'paid' })
  }),
  route('get', '/api/loyalty/programs/', () => ok(programs)),
  route('post', '/api/loyalty/programs/', ({ body }) => {
    const item = { ...(body as unknown as LoyaltyProgramInput), id: ++id, clients_count: 0 }
    programs.push(item)
    return created(item)
  }),
  route('put', '/api/loyalty/programs/:id/', ({ body, params }) => {
    const index = programs.findIndex((item) => String(item.id) === params.id)
    if (index < 0) return notFound()
    programs[index] = { ...programs[index], ...(body as unknown as LoyaltyProgramInput) }
    return ok(programs[index])
  }),
  route('delete', '/api/loyalty/programs/:id/', ({ params }) => {
    programs = programs.filter((item) => String(item.id) !== params.id)
    return noContent()
  }),
  route('get', '/api/campaigns/', () => ok(campaigns)),
  route('post', '/api/campaigns/', ({ body }) => {
    const input = body as unknown as CampaignInput
    const item: Campaign = {
      ...input,
      id: ++id,
      created_at: stamp(),
      status: 'sent',
      total_recipients: input.recipients.length,
      success_count: input.recipients.length,
      success_rate: input.recipients.length ? 100 : 0,
    }
    campaigns.unshift(item)
    return created(item)
  }),
]
