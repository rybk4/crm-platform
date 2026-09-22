import MuiCheckbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <FormControlLabel
      control={<MuiCheckbox checked={checked} onChange={(event) => onChange(event.target.checked)} />}
      label={label}
      disabled={disabled}
    />
  )
}
