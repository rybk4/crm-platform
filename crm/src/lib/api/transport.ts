export interface TransportRequest {
  method: string
  /** Путь без базового адреса, например `/api/clients/12/`. */
  url: string
  params: Record<string, unknown>
  body: unknown
  headers: Record<string, string>
}

export interface TransportResponse {
  status: number
  data: unknown
}

/**
 * Перехватчик запросов: возвращает ответ или `null`, если запрос должен уйти
 * в сеть как обычно. Нужен слою демо-данных и тестам — сам по себе он ничего
 * не знает ни о моках, ни о предметной области.
 */
export type TransportOverride = (
  request: TransportRequest,
) => Promise<TransportResponse | null> | TransportResponse | null

let override: TransportOverride | null = null

export function setTransportOverride(next: TransportOverride | null) {
  override = next
}

export function transportOverride() {
  return override
}
