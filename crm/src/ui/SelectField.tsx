import MenuItem from '@mui/material/MenuItem'
import MuiTextField from '@mui/material/TextField'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

export function SelectField({ id, label, value, options, onChange, disabled, required }: SelectFieldProps) {
  return (
    <MuiTextField
      id={id}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      required={required}
      select
      fullWidth
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </MuiTextField>
  )
}
