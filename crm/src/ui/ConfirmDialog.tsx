import { Button } from './Button'
import { Dialog } from './Dialog'
import { Text } from './Text'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/** Подтверждение необратимого действия: удаления записи, клиента, услуги. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      maxWidth="sm"
      onClose={onCancel}
      actions={
        <>
          <Button kind="quiet" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button kind="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Text tone="muted">{description}</Text>
    </Dialog>
  )
}
