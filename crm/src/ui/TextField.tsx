import MuiTextField from '@mui/material/TextField'

interface TextFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: boolean
  helperText?: string
  autoComplete?: string
  autoFocus?: boolean
  inputMode?: 'text' | 'tel' | 'numeric'
  disabled?: boolean
  type?: 'text' | 'tel' | 'url' | 'number' | 'time' | 'date' | 'email'
  placeholder?: string
  multiline?: boolean
  rows?: number
  required?: boolean
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
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
}: TextFieldProps) {
  return (
    <MuiTextField
      id={id}
      name={name}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
        inputLabel: type === 'date' ? { shrink: true } : undefined,
      }}
    />
  )
}
