import type { EntityId } from '@/lib/api/entityId'

export type BillType = 'income' | 'expense'
export type CommissionType = 'percent' | 'fixed'

export interface Bill {
  id: EntityId
  name: string
  amount: string
  description: string
  bill_type: BillType
  payment_methods: EntityId[]
  create_date: string
  update_date: string
}

export type BillInput = Pick<
  Bill,
  'name' | 'amount' | 'description' | 'bill_type' | 'payment_methods'
>

export interface PaymentMethod {
  id: EntityId
  name: string
  commission: string
  commission_type: CommissionType
  is_active: boolean
  create_date: string
  update_date: string
}

export type PaymentMethodInput = Pick<
  PaymentMethod,
  'name' | 'commission' | 'commission_type' | 'is_active'
>
