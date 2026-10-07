import { statusMeta } from '../model'
import type { AppointmentCardProps } from './AppointmentCard.types'
export type { AppointmentCardProps } from './AppointmentCard.types'

export function AppointmentCard({ appointment, style, onOpen }: AppointmentCardProps) {
  const meta = statusMeta[appointment.status]
  const compact = style ? style.height < 64 : false

  return (
    <button
      className="appointment-card"
      type="button"
      data-tone={meta.tone}
      data-status={appointment.status}
      data-compact={compact}
      data-positioned={Boolean(style)}
      style={style ? { top: style.top, height: style.height } : undefined}
      onClick={() => onOpen(appointment)}
    >
      <span className="appointment-card__body">
        <strong>{appointment.client_name}</strong>
        <span>{appointment.service_name}</span>
      </span>
    </button>
  )
}
