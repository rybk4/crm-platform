import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { AppErrorBoundary } from './AppErrorBoundary'

function Boom({ explode }: { explode: boolean }) {
  if (explode) throw new Error('внутренняя ошибка')
  return <p>раздел</p>
}

function renderApp(explode: boolean) {
  return render(
    <MemoryRouter initialEntries={['/journal']}>
      <LocaleProvider>
        <AppErrorBoundary>
          <Boom explode={explode} />
        </AppErrorBoundary>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AppErrorBoundary', () => {
  it('рендерит приложение, пока ошибок нет', () => {
    renderApp(false)

    expect(screen.getByText('раздел')).toBeInTheDocument()
  })

  it('вместо белого экрана показывает карточку «что-то пошло не так»', () => {
    renderApp(true)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Обновить страницу' })).toBeInTheDocument()
  })

  it('по «Обновить страницу» перезагружает вкладку', async () => {
    const reload = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      reload,
    } as unknown as Location)

    renderApp(true)
    await userEvent.click(screen.getByRole('button', { name: 'Обновить страницу' }))

    expect(reload).toHaveBeenCalledOnce()
  })
})
