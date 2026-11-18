export interface TextFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  helperText?: string
  autoComplete?: string
  autoFocus?: boolean
  inputMode?: 'text' | 'tel' | 'numeric'
  disabled?: boolean
  type?: 'text' | 'tel' | 'url' | 'number' | 'time' | 'date' | 'email'
  mask?: 'phone'
  placeholder?: string
  multiline?: boolean
  rows?: number
  required?: boolean
}
