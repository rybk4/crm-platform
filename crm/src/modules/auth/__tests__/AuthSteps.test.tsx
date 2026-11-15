import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { PhoneStep } from '../components/PhoneStep'
import { CodeStep } from '../components/CodeStep'

describe('auth forms', () => {
  it('enables submission only for a complete phone and restores the empty field on clearing', () => {
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
    expect(button).toBeDisabled()
    fireEvent.change(phone, { target: { value: '870012345' } })
    expect(button).toBeDisabled()
    fireEvent.change(phone, { target: { value: '87001234567' } })
    expect(phone).toHaveValue('+7 (700) 123-45-67')
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(submit).toHaveBeenCalledExactlyOnceWith('+7 (700) 123-45-67')
    fireEvent.change(phone, { target: { value: '' } })
    expect(phone).toHaveValue('')
    expect(button).toBeDisabled()
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
