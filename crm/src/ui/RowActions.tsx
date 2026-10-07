import type { RowActionsProps } from './RowActions.types'
export type { RowActionsProps } from './RowActions.types'

import './row-actions.css'

/** Иконочные действия в конце строки списка. */
export function RowActions({ children }: RowActionsProps) {
  return <div className="ui-row-actions">{children}</div>
}
