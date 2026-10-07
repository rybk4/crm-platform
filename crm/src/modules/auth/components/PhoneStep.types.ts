export interface PhoneStepProps {
  initialPhone: string
  loading: boolean
  errorMessage: string
  onSubmit: (phone: string) => Promise<void>
}
