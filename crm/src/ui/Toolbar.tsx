import type { ReactNode } from 'react'

import { Surface } from './Surface'
import './toolbar.css'

interface ToolbarProps {
  children: ReactNode
  /** Раскладку полей задаёт раздел: здесь только подложка и отступы. */
  className?: string
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <Surface className={className ? `ui-toolbar ${className}` : 'ui-toolbar'}>{children}</Surface>
  )
}

interface ToolbarFieldProps {
  label: string
  value: string
  hint?: string
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
