import { authenticatedRequest } from '../../../lib/api/http'
import type { Branch, Organization } from '../types'

export const organizationsApi = {
  list: () => authenticatedRequest<Organization[]>('/api/organizations/'),
  listBranches: () => authenticatedRequest<Branch[]>('/api/branches/'),
}
