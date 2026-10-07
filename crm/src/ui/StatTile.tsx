import { Icon } from './Icon'
import { Surface } from './Surface'
import type { StatTileProps } from './StatTile.types'
export type { StatDirection, StatTileProps } from './StatTile.types'

import './stat-tile.css'

export function StatTile({
  label,
  value,
  icon,
  hint,
  deltaLabel,
  direction = 'flat',
  deltaGood = true,
}: StatTileProps) {
  return (
    <Surface className="stat-tile">
      <div className="stat-tile__top">
        <span className="stat-tile__label">{label}</span>
        <span className="stat-tile__icon" aria-hidden="true">
          <Icon name={icon} size={16} />
        </span>
      </div>

      <strong className="stat-tile__value">{value}</strong>

      {deltaLabel ? (
        <span className="stat-tile__delta" data-direction={direction} data-good={deltaGood}>
          {direction !== 'flat' ? (
            <Icon name={direction === 'up' ? 'trend-up' : 'trend-down'} size={14} />
          ) : null}
          {deltaLabel}
        </span>
      ) : null}

      {hint ? <span className="stat-tile__hint">{hint}</span> : null}
    </Surface>
  )
}
