import type { TransportResponse } from '@/lib/api/transport'

export interface MockContext {
  params: Record<string, string>
  query: Record<string, string>
  body: Record<string, unknown>
}

export interface MockRoute {
  method: string
  path: string
  handle: (context: MockContext) => TransportResponse
}

export function route(
  method: string,
  path: string,
  handle: (context: MockContext) => TransportResponse,
): MockRoute {
  return { method, path, handle }
}

export function ok(data: unknown): TransportResponse {
  return { status: 200, data }
}

export function created(data: unknown): TransportResponse {
  return { status: 201, data }
}

export function noContent(): TransportResponse {
  return { status: 204, data: null }
}

export function notFound(): TransportResponse {
  return { status: 404, data: { detail: 'Not found.' } }
}

export function badRequest(errors: Record<string, string[]>): TransportResponse {
  return { status: 400, data: errors }
}

/** `/api/clients/:id/visits/` → параметры пути, либо null, если шаблон не подходит. */
export function matchPath(pattern: string, path: string) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('?')[0].split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}

  for (const [index, part] of patternParts.entries()) {
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[index]
      continue
    }

    if (part !== pathParts[index]) return null
  }

  return params
}

export function matchRoute(routes: readonly MockRoute[], method: string, path: string) {
  for (const candidate of routes) {
    if (candidate.method !== method) continue

    const params = matchPath(candidate.path, path)
    if (params) return { route: candidate, params }
  }

  return null
}
