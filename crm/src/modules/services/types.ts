import type { EntityId } from '@/lib/api/entityId'

export interface Service {
  id: EntityId
  specialist: EntityId
  specialist_name: string
  specialists?: EntityId[]
  specialist_names?: string[]
  branch_id: EntityId
  branch_name: string
  organization_id: EntityId
  name: string
  description: string
  duration_minutes: number
  price: string
  price_max?: string | null
  category?: EntityId
  category_name?: string
  currency: string
  is_active: boolean
}

export type ServiceInput = Pick<
  Service,
  'specialist' | 'name' | 'description' | 'duration_minutes' | 'price' | 'currency' | 'is_active'
>
