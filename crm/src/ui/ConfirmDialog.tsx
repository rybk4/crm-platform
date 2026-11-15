import { Button } from './Button'
import { Dialog } from './Dialog'
import { SidePanel } from './SidePanel'
import { Text } from './Text'
import type { ConfirmDialogProps } from './ConfirmDialog.types'
export type { ConfirmDialogProps } from './ConfirmDialog.types'

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
  sidePanel = false,
}: ConfirmDialogProps) {
  if (sidePanel)
    return (
      <SidePanel
        floating
        open={open}
        title={title}
        onClose={onCancel}
        tone="danger"
        footer={
          <>
            <Button kind="danger" loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
            <Button kind="quiet" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </>
        }
      >
        <Text tone="muted">{description}</Text>
      </SidePanel>
    )
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
