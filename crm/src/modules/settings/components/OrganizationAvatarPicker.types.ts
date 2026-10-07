export interface OrganizationAvatarPickerProps {
  url: string | null
  name: string
  onPick: (file: File) => void
  onRemove: () => void
}
