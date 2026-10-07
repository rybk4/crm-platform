export interface OrganizationPhotosProps {
  photos: string[]
  onAdd: (files: File[]) => void
  onRemove: (url: string) => void
}
