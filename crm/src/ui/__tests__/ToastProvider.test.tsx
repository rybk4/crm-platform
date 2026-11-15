import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { notifications } from '@/lib/toast/notifications'
import { ToastProvider } from '../ToastProvider'

describe('ToastProvider', () => {
  it('shows a repeated error once and offers an accessible close button', async () => {
    render(
      <LocaleProvider>
        <ToastProvider />
      </LocaleProvider>,
    )

    act(() => {
      notifications.error('Пользователь с таким номером не найден.')
      notifications.error('Пользователь с таким номером не найден.')
    })

    const message = await screen.findByText('Пользователь с таким номером не найден.')
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByLabelText('Уведомления')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть уведомление' }))
    fireEvent.animationEnd(message)
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
