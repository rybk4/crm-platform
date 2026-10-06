import type { EntityId } from '@/lib/api/entityId'

export const specialistKeys = {
  all: ['specialists'] as const,
  list: (branchId: EntityId | null = null) => [...specialistKeys.all, 'list', branchId] as const,
}
