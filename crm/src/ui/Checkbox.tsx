import MuiCheckbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { CheckboxProps } from './Checkbox.types'
export type { CheckboxProps } from './Checkbox.types'

export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox checked={checked} onChange={(event) => onChange(event.target.checked)} />
      }
      label={label}
      disabled={disabled}
    />
  )
}
