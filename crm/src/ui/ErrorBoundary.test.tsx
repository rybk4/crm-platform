import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

function Boom({ explode }: { explode: boolean }): React.JSX.Element {
  if (explode) throw new Error('boom')
  return <p>содержимое</p>
}

function renderFallback(error: Error, retry: () => void) {
  return (
    <div>
      <span>сломалось: {error.message}</span>
      <button type="button" onClick={retry}>
        повторить
      </button>
    </div>
  )
}

beforeEach(() => {
  // React печатает пойманную ошибку в консоль — в тестах это лишний шум.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('показывает детей, пока ошибки нет', () => {
    render(
      <ErrorBoundary renderFallback={renderFallback}>
        <Boom explode={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('содержимое')).toBeInTheDocument()
  })

  it('показывает fallback с текстом ошибки вместо падения', () => {
    render(
      <ErrorBoundary renderFallback={renderFallback}>
        <Boom explode />
      </ErrorBoundary>,
    )

    expect(screen.getByText('сломалось: boom')).toBeInTheDocument()
  })

  it('сообщает об ошибке через onError', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary renderFallback={renderFallback} onError={onError}>
        <Boom explode />
      </ErrorBoundary>,
    )

    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('по «повторить» снова рендерит детей, если причина ушла', async () => {
    function Host() {
      const [explode, setExplode] = useState(true)
      return (
        <div>
          <button type="button" onClick={() => setExplode(false)}>
            починить
          </button>
          <ErrorBoundary renderFallback={renderFallback}>
            <Boom explode={explode} />
          </ErrorBoundary>
        </div>
      )
    }

    render(<Host />)
    expect(screen.getByText('сломалось: boom')).toBeInTheDocument()

    await userEvent.click(screen.getByText('починить'))
    await userEvent.click(screen.getByText('повторить'))

    expect(screen.getByText('содержимое')).toBeInTheDocument()
  })

  it('сбрасывается при смене resetKey', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/journal" renderFallback={renderFallback}>
        <Boom explode />
      </ErrorBoundary>,
    )
    expect(screen.getByText('сломалось: boom')).toBeInTheDocument()

    rerender(
      <ErrorBoundary resetKey="/clients" renderFallback={renderFallback}>
        <Boom explode={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('содержимое')).toBeInTheDocument()
  })
})
