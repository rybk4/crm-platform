import type { IconName } from './Icon'

export type StatDirection = 'up' | 'down' | 'flat'

export interface StatTileProps {
  label: string
  value: string
  icon: IconName
  hint?: string
  deltaLabel?: string
  /** Куда смотрит стрелка; хорошо это или плохо, решает `deltaGood`. */
  direction?: StatDirection
  deltaGood?: boolean
}
