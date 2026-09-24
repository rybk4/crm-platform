import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { OtpInput } from './OtpInput'

function OtpFixture() {
  const [value, setValue] = useState('')
  return (
    <OtpInput value={value} getDigitLabel={(position) => `Цифра ${position}`} onChange={setValue} />
  )
}

function getDigits() {
  return [1, 2, 3, 4].map((position) => screen.getByLabelText(`Цифра ${position}`))
}

describe('OtpInput', () => {
  it('вводит только цифры и переносит фокус вперёд', async () => {
    const user = userEvent.setup()
    render(<OtpFixture />)
    const digits = getDigits()

    await user.type(digits[0], '1a2')

    expect(digits[0]).toHaveValue('1')
    expect(digits[1]).toHaveValue('2')
    expect(digits[2]).toHaveFocus()
  })

  it('вставляет весь код и отбрасывает посторонние символы', () => {
    render(<OtpFixture />)
    const digits = getDigits()

    fireEvent.paste(digits[0], {
      clipboardData: { getData: () => '0a12-3' },
    })

    expect(digits.map((digit) => (digit as HTMLInputElement).value)).toEqual(['0', '1', '2', '3'])
    expect(digits[3]).toHaveFocus()
  })

  it('удаляет предыдущую цифру при Backspace в пустой ячейке', async () => {
    const user = userEvent.setup()
    render(<OtpFixture />)
    const digits = getDigits()

    fireEvent.paste(digits[0], {
      clipboardData: { getData: () => '123' },
    })
    await user.click(digits[3])
    await user.keyboard('{Backspace}')

    expect(digits[2]).toHaveValue('')
    expect(digits[2]).toHaveFocus()
  })
})
