import { Icon } from './Icon'
import type { SegmentedControlProps } from './SegmentedControl.types'
export type { SegmentedOption, SegmentedControlProps } from './SegmentedControl.types'

import './segmented-control.css'

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
