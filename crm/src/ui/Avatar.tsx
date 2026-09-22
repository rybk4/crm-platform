import MuiAvatar from '@mui/material/Avatar'

interface AvatarProps {
  label: string
  value: string
  className?: string
  src?: string
}

export function Avatar({ label, value, className, src }: AvatarProps) {
  return (
    <MuiAvatar className={className} aria-label={label} src={src || undefined}>
      {value}
    </MuiAvatar>
  )
}
