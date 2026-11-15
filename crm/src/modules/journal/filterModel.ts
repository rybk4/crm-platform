import { sameEntityId } from '@/lib/api/entityId'
import type { Specialist } from '@/modules/specialists/types'
import type { Service } from '@/modules/services/types'
import type { Appointment } from './types'

export interface JournalSettings {
  step: number
  services: string[]
  professions: string[]
  presence: string
  sort: string
}
export const initialJournalSettings: JournalSettings = {
  step: 30,
  services: [],
  professions: [],
  presence: '',
  sort: '',
}
export function filterJournalStaff(
  staff: readonly Specialist[],
  appointments: readonly Appointment[],
  services: readonly Service[],
  settings: JournalSettings,
) {
  const count = (person: Specialist) =>
    appointments.filter((a) => sameEntityId(a.specialist, person.id)).length
  const result = staff.filter((person) => {
    const matchingService =
      !settings.services.length ||
      services.some(
        (s) =>
          settings.services.includes(String(s.id)) &&
          (sameEntityId(s.specialist, person.id) ||
            s.specialists?.some((id) => sameEntityId(id, person.id))),
      )
    return (
      matchingService &&
      (!settings.professions.length || settings.professions.includes(person.job_title)) &&
      (settings.presence === '' || count(person) > 0 === (settings.presence === 'true'))
    )
  })
  if (settings.sort === 'name') result.sort((a, b) => a.full_name.localeCompare(b.full_name))
  if (settings.sort === 'profession') result.sort((a, b) => a.job_title.localeCompare(b.job_title))
  if (settings.sort === 'appointment') result.sort((a, b) => count(b) - count(a))
  return result
}
