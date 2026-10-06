export const financeKeys = {
  all: ['finance'] as const,
  bills: () => [...financeKeys.all, 'bills'] as const,
  paymentMethods: () => [...financeKeys.all, 'payment-methods'] as const,
}
