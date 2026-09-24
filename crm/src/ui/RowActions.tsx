import type { ReactNode } from 'react'

import './row-actions.css'

interface RowActionsProps {
  children: ReactNode
}

/** Иконочные действия в конце строки списка. */
export function RowActions({ children }: RowActionsProps) {
  return <div className="ui-row-actions">{children}</div>
}
