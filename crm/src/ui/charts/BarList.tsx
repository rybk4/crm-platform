import './charts.css'

export interface BarItem {
  id: string
  label: string
  value: number
  valueLabel: string
  hint?: string
}

interface BarListProps {
  items: readonly BarItem[]
  ariaLabel: string
}

export function BarList({ items, ariaLabel }: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 0)

  return (
    <ul className="bar-list" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.id} className="bar-list__row">
          <div className="bar-list__head">
            <span className="bar-list__label">{item.label}</span>
            <strong className="bar-list__value">{item.valueLabel}</strong>
          </div>
          <div className="bar-list__track">
            <span
              className="bar-list__fill"
              style={{ width: `${max > 0 ? Math.max((item.value / max) * 100, 1.5) : 0}%` }}
            />
          </div>
          {item.hint ? <small className="bar-list__hint">{item.hint}</small> : null}
        </li>
      ))}
    </ul>
  )
}
