export const specialistKeys = {
  all: ['specialists'] as const,
  list: (branchId: number | null = null) => [...specialistKeys.all, 'list', branchId] as const,
}
