export interface SearchFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hideLabel?: boolean
  placeholder?: string
  clearLabel?: string
}
