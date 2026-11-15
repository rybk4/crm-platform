export interface CodeStepProps {
  phone: string
  loading: boolean
  rejected: boolean
  onEdit: () => void
  onSubmit: (code: string) => Promise<void>
  onBack: () => void
}
