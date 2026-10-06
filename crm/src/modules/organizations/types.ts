import type { EntityId } from '@/lib/api/entityId'

export interface Organization {
  id: EntityId
  name: string
  slug: string
  currency: string
  role: 'owner' | 'admin' | 'manager'
  branches_count: number
}

export interface Branch {
  id: EntityId
  organization: EntityId
  organization_name: string
  name: string
  address: string
  phone: string
  is_active: boolean
  specialists_count: number
}
