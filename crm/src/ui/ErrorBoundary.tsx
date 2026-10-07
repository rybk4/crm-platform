import { Component, type ErrorInfo } from 'react'
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'
export type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, resetKey: props.resetKey }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey === state.resetKey) return null
    return { error: null, resetKey: props.resetKey }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  retry = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (error) return this.props.renderFallback(error, this.retry)
    return this.props.children
  }
}
