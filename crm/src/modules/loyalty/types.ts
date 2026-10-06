import type { EntityId } from '@/lib/api/entityId'

export type LoyaltyKind = 'bonus' | 'subscription' | 'certificate'
export interface LoyaltyProgram {
  id: EntityId
  kind: LoyaltyKind
  name: string
  price: string
  reward_percent: string
  initial_balance: string
  visits_count: number | null
  validity_days: number | null
  services: EntityId[]
  excluded_payment_methods: EntityId[]
  is_active: boolean
  clients_count: number
}
export type LoyaltyProgramInput = Omit<LoyaltyProgram, 'id' | 'clients_count'>
