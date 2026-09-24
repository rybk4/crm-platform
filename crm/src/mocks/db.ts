import type { Client, ClientSegment } from '@/modules/clients/types'
import type { Appointment } from '@/modules/journal/types'
import type { Branch } from '@/modules/organizations/types'
import type { Service } from '@/modules/services/types'
import type { Specialist } from '@/modules/specialists/types'
import { generateAppointments } from './fixtures/appointments'
import { branches } from './fixtures/organization'
import { clients } from './fixtures/clients'
import { services } from './fixtures/services'
import { specialists } from './fixtures/specialists'

export const VIP_TOTAL = 300000
export const REGULAR_VISITS = 4
export const SLEEPING_DAYS = 45

interface MockDatabase {
  branches: Branch[]
  specialists: Specialist[]
  services: Service[]
  clients: Client[]
  appointments: Appointment[]
}

function clone<T>(items: readonly T[]): T[] {
  return items.map((item) => ({ ...item }))
}

export const db: MockDatabase = {
  branches: clone(branches),
  specialists: clone(specialists),
  services: clone(services),
  clients: clone(clients),
  appointments: generateAppointments(),
}

export function nextId(items: readonly { id: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function segmentOf(visits: number, totalSpent: number, lastVisit: Date | null, now: Date) {
  const sleepingSince = new Date(now)
  sleepingSince.setDate(sleepingSince.getDate() - SLEEPING_DAYS)

  if (totalSpent >= VIP_TOTAL) return 'vip' satisfies ClientSegment
  if (visits >= 2 && lastVisit && lastVisit < sleepingSince)
    return 'sleeping' satisfies ClientSegment
  if (visits >= REGULAR_VISITS) return 'regular' satisfies ClientSegment
  return 'new' satisfies ClientSegment
}

/**
 * Пересчитывает всё, что на бэкенде было бы агрегатами: счётчик услуг
 * специалиста и историю клиента. Вызывается после каждой правки данных.
 */
export function refreshDerived(now = new Date()) {
  for (const specialist of db.specialists) {
    specialist.services_count = db.services.filter(
      (service) => service.specialist === specialist.id,
    ).length
  }

  for (const client of db.clients) {
    const visits = db.appointments.filter(
      (appointment) => appointment.client === client.id && appointment.status === 'completed',
    )
    const totalSpent = visits.reduce((sum, visit) => sum + Number(visit.price), 0)
    const lastVisit = visits.reduce<Date | null>((latest, visit) => {
      const date = new Date(visit.starts_at)
      return !latest || date > latest ? date : latest
    }, null)
    const firstVisit = visits.reduce<Date | null>((earliest, visit) => {
      const date = new Date(visit.starts_at)
      return !earliest || date < earliest ? date : earliest
    }, null)

    client.visits_count = visits.length
    client.total_spent = String(totalSpent)
    client.average_check = visits.length ? String(Math.round(totalSpent / visits.length)) : '0'
    client.first_visit_at = firstVisit ? firstVisit.toISOString() : null
    client.last_visit_at = lastVisit ? lastVisit.toISOString() : null
    client.segment = segmentOf(visits.length, totalSpent, lastVisit, now)
  }
}

refreshDerived()
