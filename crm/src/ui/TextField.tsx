import MuiTextField from '@mui/material/TextField'
import { usePhoneInput } from './usePhoneInput'
import type { TextFieldProps } from './TextField.types'
export type { TextFieldProps } from './TextField.types'

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  autoComplete,
  autoFocus = false,
  inputMode = 'text',
  disabled = false,
  type = 'text',
  multiline = false,
  rows,
  required = false,
  placeholder,
  mask,
}: TextFieldProps) {
  const input = usePhoneInput(value, onChange, mask === 'phone')

  return (
    <MuiTextField
      id={id}
      name={name}
      label={label}
      value={value}
      onBlur={onBlur}
      onChange={input.change}
      onKeyDown={input.keyDown}
      inputRef={input.inputRef}
      error={error}
      helperText={helperText}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      disabled={disabled}
      type={type}
      multiline={multiline}
      rows={rows}
      required={required}
      placeholder={placeholder}
      fullWidth
      slotProps={{
        htmlInput: { inputMode },
        inputLabel: type === 'date' || mask === 'phone' ? { shrink: true } : undefined,
      }}
    />
  )
}
