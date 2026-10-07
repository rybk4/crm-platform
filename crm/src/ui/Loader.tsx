import type { LoaderProps } from './Loader.types'
export type { LoaderProps } from './Loader.types'

import './loader.css'

/** Единственный вид ожидания данных во всех разделах. */
export function Loader({ label }: LoaderProps) {
  return (
    <p className="ui-loader" role="status" aria-live="polite">
      <span className="ui-loader__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label}
    </p>
  )
}
