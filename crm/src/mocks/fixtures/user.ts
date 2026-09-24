import type { AuthUser } from '@/modules/auth/types'
import { defaultBranch, organization } from './organization'

export const demoUser: AuthUser = {
  id: 1,
  name: 'Айгерим Сапарова',
  phone_number: '+77001234567',
  locale: 'ru',
  active_branch: defaultBranch.id,
  active_branch_details: {
    id: defaultBranch.id,
    name: defaultBranch.name,
    address: defaultBranch.address,
    organization: organization.id,
    organization_name: organization.name,
  },
  is_staff: true,
  date_joined: '2026-02-14T09:12:00.000Z',
}
