import { describe, expect, it } from 'vitest'
import type { Specialist } from '@/modules/specialists/types'
import type { Appointment } from '../types'
import type { Service } from '@/modules/services/types'
import { filterJournalStaff, initialJournalSettings } from '../filterModel'

const staff: Specialist[] = [
  {
    id: 1,
    branch: 1,
    branch_name: '',
    organization_id: 1,
    organization_name: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    full_name: 'Zara',
    job_title: 'Hair',
    phone_number: '',
    photo_url: '',
    bio: '',
    is_active: true,
    services_count: 1,
    certificates: [],
    schedule: [],
  },
  {
    id: 2,
    branch: 1,
    branch_name: '',
    organization_id: 1,
    organization_name: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    full_name: 'Anna',
    job_title: 'Brows',
    phone_number: '',
    photo_url: '',
    bio: '',
    is_active: true,
    services_count: 1,
    certificates: [],
    schedule: [],
  },
]
const appointment: Appointment = {
  id: 1,
  branch: 1,
  branch_name: '',
  specialist: 1,
  specialist_name: '',
  service: 1,
  service_name: '',
  client: 1,
  client_name: '',
  client_phone: '',
  starts_at: '2026-10-21T09:00:00Z',
  ends_at: '2026-10-21T10:00:00Z',
  duration_minutes: 60,
  price: '100',
  currency: 'KZT',
  status: 'confirmed',
  source: 'crm',
  comment: '',
  created_at: '',
}
const service: Service = {
  id: 1,
  specialist: 1,
  specialist_name: '',
  specialists: [1, 2],
  branch_id: 1,
  branch_name: '',
  organization_id: 1,
  name: 'Service',
  description: '',
  duration_minutes: 60,
  price: '100',
  currency: 'KZT',
  is_active: true,
}

describe('journal staff filters', () => {
  it('filters by services including multiple staff associations and professions', () => {
    expect(
      filterJournalStaff(staff, [], [service], { ...initialJournalSettings, services: ['1'] }),
    ).toHaveLength(2)
    expect(
      filterJournalStaff(staff, [], [service], {
        ...initialJournalSettings,
        services: ['1'],
        professions: ['Brows'],
      }),
    ).toEqual([staff[1]])
    expect(
      filterJournalStaff(staff, [], [service], {
        ...initialJournalSettings,
        services: ['missing'],
      }),
    ).toEqual([])
  })
  it('filters staff by appointments without hiding empty days by default', () => {
    expect(filterJournalStaff(staff, [], [], initialJournalSettings)).toHaveLength(2)
    expect(
      filterJournalStaff(staff, [appointment], [], { ...initialJournalSettings, presence: 'true' }),
    ).toEqual([staff[0]])
    expect(
      filterJournalStaff(staff, [appointment], [], {
        ...initialJournalSettings,
        presence: 'false',
      }),
    ).toEqual([staff[1]])
  })
  it('sorts by name, profession and appointments without mutating the source', () => {
    for (const sort of ['name', 'profession'])
      expect(filterJournalStaff(staff, [], [], { ...initialJournalSettings, sort })[0].id).toBe(2)
    expect(
      filterJournalStaff([...staff].reverse(), [appointment], [], {
        ...initialJournalSettings,
        sort: 'appointment',
      })[0].id,
    ).toBe(1)
    expect(staff[0].id).toBe(1)
  })
})
