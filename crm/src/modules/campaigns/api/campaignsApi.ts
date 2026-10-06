import { ApiClient } from '@/lib/api/ApiClient'
import type { Campaign, CampaignInput } from '../types'

class CampaignsApi extends ApiClient {
  constructor() {
    super('/api/campaigns/')
  }
  list(options?: { signal?: AbortSignal }) {
    return this.get<Campaign[]>('', options)
  }
  create(input: CampaignInput) {
    return this.post<Campaign>('', input)
  }
}
export const campaignsApi = new CampaignsApi()
