export interface PhoneStepProps {
  initialPhone: string
  loading: boolean
  rejected: boolean
  onEdit: () => void
  onSubmit: (phone: string) => Promise<void>
}
