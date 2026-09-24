import type { Branch, Organization } from '@/modules/organizations/types'

export const organization: Organization = {
  id: 1,
  name: 'Студия красоты «Лаванда»',
  slug: 'lavanda',
  currency: 'KZT',
  role: 'owner',
  branches_count: 2,
}

export const branches: Branch[] = [
  {
    id: 1,
    organization: organization.id,
    organization_name: organization.name,
    name: 'Лаванда на Абая',
    address: 'Алматы, проспект Абая, 44',
    phone: '+7 727 350 11 20',
    is_active: true,
    specialists_count: 4,
  },
  {
    id: 2,
    organization: organization.id,
    organization_name: organization.name,
    name: 'Лаванда в Ботаническом',
    address: 'Алматы, улица Тимирязева, 17',
    phone: '+7 727 350 11 21',
    is_active: true,
    specialists_count: 2,
  },
]

export const defaultBranch = branches[0]
