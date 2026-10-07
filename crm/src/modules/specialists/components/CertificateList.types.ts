import type { SpecialistCertificate } from '../types'

export interface CertificateListProps {
  certificates: SpecialistCertificate[]
  onAdd: () => void
  onChange: (index: number, changes: Partial<SpecialistCertificate>) => void
  onRemove: (index: number) => void
}
