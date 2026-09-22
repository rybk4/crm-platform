export interface Service {
  id: number
  specialist: number
  specialist_name: string
  branch_id: number
  branch_name: string
  organization_id: number
  name: string
  description: string
  duration_minutes: number
  price: string
  currency: string
  is_active: boolean
}

export type ServiceInput = Pick<
  Service,
  'specialist' | 'name' | 'description' | 'duration_minutes' | 'price' | 'currency' | 'is_active'
>
