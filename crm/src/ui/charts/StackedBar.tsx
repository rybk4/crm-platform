import type { StatusTone } from '../StatusPill'
import './charts.css'

export interface StackedSegment {
  id: string
  label: string
  value: number
  valueLabel: string
  tone: StatusTone
}

interface StackedBarProps {
  segments: readonly StackedSegment[]
  ariaLabel: string
}

export function StackedBar({ segments, ariaLabel }: StackedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const visible = segments.filter((segment) => segment.value > 0)

  return (
    <div className="stacked-bar">
      <div className="stacked-bar__track" role="img" aria-label={ariaLabel}>
        {visible.map((segment) => (
          <span
            key={segment.id}
            className="stacked-bar__segment"
            data-tone={segment.tone}
            style={{ flexGrow: segment.value }}
          />
        ))}
      </div>

      <ul className="stacked-bar__legend">
        {segments.map((segment) => (
          <li key={segment.id} className="stacked-bar__legend-item">
            <span className="stacked-bar__swatch" data-tone={segment.tone} aria-hidden="true" />
            <span className="stacked-bar__legend-label">{segment.label}</span>
            <strong>{segment.valueLabel}</strong>
            <small>{total > 0 ? `${Math.round((segment.value / total) * 100)}%` : '0%'}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
