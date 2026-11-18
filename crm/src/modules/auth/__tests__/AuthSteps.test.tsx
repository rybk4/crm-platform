import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { PhoneStep } from '../components/PhoneStep'
import { CodeStep } from '../components/CodeStep'

describe('auth forms', () => {
  it('validates incomplete input and restores the empty field on clearing', () => {
    const submit = vi.fn()
    render(
      <LocaleProvider>
        <PhoneStep
          initialPhone="+7"
          loading={false}
          rejected={false}
          onEdit={vi.fn()}
          onSubmit={submit}
        />
      </LocaleProvider>,
    )
    const phone = screen.getByPlaceholderText('+7 (700) 123-45-67')
    expect(phone).toHaveValue('')
    const button = screen.getByRole('button', { name: 'Получить код' })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(submit).not.toHaveBeenCalled()
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(phone, { target: { value: '870012345' } })
    expect(button).toBeEnabled()
    fireEvent.change(phone, { target: { value: '87001234567' } })
    expect(phone).toHaveValue('+7 (700) 123-45-67')
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(submit).toHaveBeenCalledExactlyOnceWith('+7 (700) 123-45-67')
    fireEvent.change(phone, { target: { value: '' } })
    expect(phone).toHaveValue('')
    expect(button).toBeEnabled()
  })

  it('allows repeated backspace, middle edits, selection replacement and clearing', async () => {
    const user = userEvent.setup()
    render(
      <LocaleProvider>
        <PhoneStep
          initialPhone="+7"
          loading={false}
          rejected={false}
          onEdit={vi.fn()}
          onSubmit={vi.fn()}
        />
      </LocaleProvider>,
    )
    const phone = screen.getByRole<HTMLInputElement>('textbox', { name: 'Номер телефона' })
    await user.type(phone, '7001234567')
    expect(phone).toHaveValue('+7 (700) 123-45-67')
    for (let index = 0; index < 12; index += 1) await user.keyboard('{Backspace}')
    expect(phone).toHaveValue('')
    await user.type(phone, '87001234567')
    expect(phone).toHaveValue('+7 (700) 123-45-67')
    await user.clear(phone)
    await user.paste('8 (700) 123-45-67')
    expect(phone).toHaveValue('+7 (700) 123-45-67')
    phone.setSelectionRange(7, 7)
    await user.keyboard('{Delete}')
    expect(phone).toHaveValue('+7 (700) 234-56-7')
    expect(phone.selectionStart).toBe(7)
    phone.setSelectionRange(4, 7)
    await user.keyboard('999')
    expect(phone).toHaveValue('+7 (999) 234-56-7')
    await user.clear(phone)
    expect(phone).toHaveValue('')
  })

  it('handles mobile separator deletion without keyboard events and validates on blur', () => {
    render(
      <LocaleProvider>
        <PhoneStep
          initialPhone="+7"
          loading={false}
          rejected={false}
          onEdit={vi.fn()}
          onSubmit={vi.fn()}
        />
      </LocaleProvider>,
    )
    const phone = screen.getByRole<HTMLInputElement>('textbox', { name: 'Номер телефона' })
    fireEvent.change(phone, { target: { value: '+7 (700)' } })
    fireEvent.input(phone, {
      target: { value: '+7 (700', selectionStart: 7 },
      inputType: 'deleteContentBackward',
    })
    expect(phone).toHaveValue('+7 (70')
    fireEvent.blur(phone)
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(phone, { target: { value: '+7 (700) 123-45-67' } })
    fireEvent.input(phone, {
      target: { value: '+7 (700 123-45-67', selectionStart: 7 },
      inputType: 'deleteContentForward',
    })
    expect(phone).toHaveValue('+7 (700) 234-56-7')
  })

  it('explains rejected phone numbers and disables inputs while submitting', () => {
    render(
      <LocaleProvider>
        <PhoneStep
          initialPhone="+77001234567"
          loading
          rejected
          onEdit={vi.fn()}
          onSubmit={vi.fn()}
        />
      </LocaleProvider>,
    )
    const phone = screen.getByRole('textbox', { name: 'Номер телефона' })
    expect(phone).toBeDisabled()
    expect(phone).toHaveAccessibleDescription('Пользователь с таким номером не найден.')
    expect(screen.getByRole('button', { name: 'Получить код' })).toBeDisabled()
  })

  it('connects a rejected code to invalid fields and clears rejection on editing', () => {
    const onEdit = vi.fn()
    render(
      <LocaleProvider>
        <CodeStep
          phone="+77001234567"
          loading={false}
          rejected
          onEdit={onEdit}
          onSubmit={vi.fn()}
          onBack={vi.fn()}
        />
      </LocaleProvider>,
    )
    const input = screen.getByLabelText('Цифра кода 1')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(input, { target: { value: '1234' } })
    expect(onEdit).toHaveBeenCalledOnce()
    expect(screen.queryByText(/тестов|DEBUG|Шаг 2/i)).not.toBeInTheDocument()
  })
})
