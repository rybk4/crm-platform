import { useQuery } from '@tanstack/react-query'

import { branchKeys } from '../api/organizationKeys'
import { organizationsApi } from '../api/organizationsApi'

interface UseBranchesOptions {
  /** Филиалы нужны не всем экранам сразу — например, меню грузит их при открытии. */
  enabled?: boolean
}

export function useBranches({ enabled = true }: UseBranchesOptions = {}) {
  return useQuery({
    queryKey: branchKeys.list(),
    queryFn: ({ signal }) => organizationsApi.listBranches({ signal }),
    enabled,
  })
}
