export interface OtpInputProps {
  value: string
  length?: number
  disabled?: boolean
  error?: boolean
  getDigitLabel: (position: number) => string
  onChange: (value: string) => void
}
