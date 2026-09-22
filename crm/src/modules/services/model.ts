import type { Service, ServiceInput } from './types'

export const supportedCurrencies = ['KZT', 'RUB', 'USD'] as const

const DEFAULT_DURATION_MINUTES = 60

export function emptyServiceForm(specialistId = 0): ServiceInput {
  return {
    specialist: specialistId,
    name: '',
    description: '',
    duration_minutes: DEFAULT_DURATION_MINUTES,
    price: '',
    currency: supportedCurrencies[0],
    is_active: true,
  }
}

export function serviceToForm(service: Service): ServiceInput {
  return {
    specialist: service.specialist,
    name: service.name,
    description: service.description,
    duration_minutes: service.duration_minutes,
    price: service.price,
    currency: service.currency,
    is_active: service.is_active,
  }
}

export function isServiceFormValid(form: ServiceInput) {
  return Boolean(form.specialist && form.name.trim() && form.duration_minutes && form.price)
}

/** Цена приходит строкой: нечисловое значение показываем как есть, а не как NaN. */
export function formatPrice(value: string, currency: string) {
  const amount = Number(value)
  if (!value.trim() || !Number.isFinite(amount)) return `${value} ${currency}`

  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount)
  return `${formatted} ${currency}`
}

export function filterBySpecialist(services: Service[], specialistFilter: string) {
  if (!specialistFilter) return services
  return services.filter((item) => String(item.specialist) === specialistFilter)
}
