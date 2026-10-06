import { ApiClient } from '@/lib/api/ApiClient'
import type { EntityId } from '@/lib/api/entityId'
import type { Bill, BillInput, PaymentMethod, PaymentMethodInput } from '../types'

class FinanceResourceApi<Entity, Input> extends ApiClient {
  constructor(basePath: string) {
    super(basePath)
  }
  list(options?: { signal?: AbortSignal }) {
    return this.get<Entity[]>('', options)
  }
  create(input: Input) {
    return this.post<Entity>('', input)
  }
  update(id: EntityId, input: Input) {
    return this.put<Entity>(`${id}/`, input)
  }
  remove(id: EntityId) {
    return this.delete(`${id}/`)
  }
}

export const billsApi = new FinanceResourceApi<Bill, BillInput>('/api/bills/')
export const paymentMethodsApi = new FinanceResourceApi<PaymentMethod, PaymentMethodInput>(
  '/api/payment-methods/',
)
