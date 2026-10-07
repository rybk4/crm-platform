export interface CodeStepProps {
  phone: string
  debugHint: string
  loading: boolean
  errorMessage: string
  onSubmit: (code: string) => Promise<void>
  onBack: () => void
}
