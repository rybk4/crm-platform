import InputAdornment from '@mui/material/InputAdornment'
import MuiTextField from '@mui/material/TextField'

import { Icon } from './Icon'
import { IconButton } from './IconButton'
import type { SearchFieldProps } from './SearchField.types'
export type { SearchFieldProps } from './SearchField.types'

export function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  clearLabel,
}: SearchFieldProps) {
  return (
    <MuiTextField
      id={id}
      name={id}
      label={label}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      type="search"
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Icon name="search" size={18} />
            </InputAdornment>
          ),
          endAdornment:
            value && clearLabel ? (
              <InputAdornment position="end">
                <IconButton ariaLabel={clearLabel} title={clearLabel} onClick={() => onChange('')}>
                  <Icon name="close" size={16} />
                </IconButton>
              </InputAdornment>
            ) : null,
        },
      }}
    />
  )
}
