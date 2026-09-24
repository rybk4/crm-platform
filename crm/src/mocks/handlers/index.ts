import type { MockRoute } from '../router'
import { analyticsRoutes } from './analyticsHandlers'
import { appointmentRoutes } from './appointmentHandlers'
import { authRoutes } from './authHandlers'
import { catalogRoutes } from './catalogHandlers'
import { clientRoutes } from './clientHandlers'

/**
 * Порядок не важен: маршруты не пересекаются. Чтобы отдать раздел настоящему
 * бэкенду, достаточно убрать его строку из этого списка.
 */
export const mockRoutes: MockRoute[] = [
  ...authRoutes,
  ...catalogRoutes,
  ...appointmentRoutes,
  ...clientRoutes,
  ...analyticsRoutes,
]
