export const clientKeys = {
  all: ['clients'] as const,
  list: () => [...clientKeys.all, 'list'] as const,
  visits: (clientId: number) => [...clientKeys.all, 'visits', clientId] as const,
}
