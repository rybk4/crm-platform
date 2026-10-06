import { ApiClient } from '@/lib/api/ApiClient'
import type { EntityId } from '@/lib/api/entityId'
import type { LoyaltyProgram, LoyaltyProgramInput } from '../types'

class LoyaltyApi extends ApiClient {
  constructor() {
    super('/api/loyalty/programs/')
  }
  list(options?: { signal?: AbortSignal }) {
    return this.get<LoyaltyProgram[]>('', options)
  }
  create(input: LoyaltyProgramInput) {
    return this.post<LoyaltyProgram>('', input)
  }
  update(id: EntityId, input: LoyaltyProgramInput) {
    return this.put<LoyaltyProgram>(`${id}/`, input)
  }
  remove(id: EntityId) {
    return this.delete(`${id}/`)
  }
}
export const loyaltyApi = new LoyaltyApi()
