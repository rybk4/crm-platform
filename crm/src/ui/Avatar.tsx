import MuiAvatar from '@mui/material/Avatar'
import type { AvatarProps } from './Avatar.types'
export type { AvatarProps } from './Avatar.types'

export function Avatar({ label, value, className, src }: AvatarProps) {
  return (
    <MuiAvatar className={className} aria-label={label} src={src || undefined}>
      {value}
    </MuiAvatar>
  )
}
