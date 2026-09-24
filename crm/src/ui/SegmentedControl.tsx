import type { IconName } from './Icon'
import { Icon } from './Icon'
import './segmented-control.css'

export interface SegmentedOption {
  value: string
  label: string
  icon?: IconName
}

interface SegmentedControlProps {
  ariaLabel: string
  value: string
  options: readonly SegmentedOption[]
  onChange: (value: string) => void
  /** Иконка без подписи: текст остаётся доступным для скринридера. */
  iconOnly?: boolean
}

export function SegmentedControl({
  ariaLabel,
  value,
  options,
  onChange,
  iconOnly = false,
}: SegmentedControlProps) {
  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          className="segmented-control__option"
          type="button"
          title={iconOnly ? option.label : undefined}
          aria-pressed={option.value === value}
          data-selected={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? <Icon name={option.icon} size={16} /> : null}
          <span data-visually-hidden={iconOnly}>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
