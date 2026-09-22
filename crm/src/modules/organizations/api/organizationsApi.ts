import { ApiClient } from '@/lib/api/ApiClient'
import type { Branch, Organization } from '../types'

class OrganizationsApi extends ApiClient {
  constructor() {
    super('/api/')
  }

  list(options?: { signal?: AbortSignal }) {
    return this.get<Organization[]>('organizations/', options)
  }

  listBranches(options?: { signal?: AbortSignal }) {
    return this.get<Branch[]>('branches/', options)
  }
}

export const organizationsApi = new OrganizationsApi()
