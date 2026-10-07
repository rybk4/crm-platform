import MenuItem from '@mui/material/MenuItem'
import MuiTextField from '@mui/material/TextField'
import type { SelectFieldProps } from './SelectField.types'
export type { SelectOption, SelectFieldProps } from './SelectField.types'

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  required,
}: SelectFieldProps) {
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
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiTextField>
  )
}
