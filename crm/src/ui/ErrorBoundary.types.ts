import type { ErrorInfo, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Смена значения сбрасывает состояние ошибки — например, при переходе по маршруту. */
  resetKey?: string | number
  renderFallback: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

export interface ErrorBoundaryState {
  error: Error | null
  resetKey: string | number | undefined
}
