import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react'

import './otp-input.css'

interface OtpInputProps {
  value: string
  length?: number
  disabled?: boolean
  error?: boolean
  getDigitLabel: (position: number) => string
  onChange: (value: string) => void
}

function digitsOnly(value: string, length: number) {
  return value.replace(/\D/g, '').slice(0, length)
}

export function OtpInput({
  value,
  length = 4,
  disabled = false,
  error = false,
  getDigitLabel,
  onChange,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  function focus(position: number) {
    inputs.current[Math.max(0, Math.min(position, length - 1))]?.focus()
  }

  function updateDigit(index: number, event: ChangeEvent<HTMLInputElement>) {
    const nextDigit = digitsOnly(event.target.value, 1)
    const next = [...digits]
    next[index] = nextDigit
    onChange(next.join(''))
    if (nextDigit && index < length - 1) focus(index + 1)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      const next = [...digits]
      next[index - 1] = ''
      onChange(next.join(''))
      focus(index - 1)
    }
    if (event.key === 'ArrowLeft') focus(index - 1)
    if (event.key === 'ArrowRight') focus(index + 1)
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = digitsOnly(event.clipboardData.getData('text'), length)
    if (!pasted) return
    event.preventDefault()
    onChange(pasted)
    focus(Math.min(pasted.length, length) - 1)
  }

  return (
    <div className="ui-otp" data-error={error} onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node
          }}
          className="ui-otp__digit"
          type="text"
          value={digit}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={getDigitLabel(index + 1)}
          disabled={disabled}
          autoFocus={index === 0}
          onChange={(event) => updateDigit(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.currentTarget.select()}
        />
      ))}
    </div>
  )
}
