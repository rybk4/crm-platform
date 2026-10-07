import { Surface } from './Surface'
import type { ToolbarProps, ToolbarFieldProps } from './Toolbar.types'
export type { ToolbarProps, ToolbarFieldProps } from './Toolbar.types'

import './toolbar.css'

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <Surface className={className ? `ui-toolbar ${className}` : 'ui-toolbar'}>{children}</Surface>
  )
}

/** Неизменяемое значение в тулбаре: активный филиал, выбранный период и т. п. */
export function ToolbarField({ label, value, hint }: ToolbarFieldProps) {
  return (
    <div className="ui-toolbar__field">
      <small>{label}</small>
      <strong>{value}</strong>
      {hint ? <span>{hint}</span> : null}
    </div>
  )
}
