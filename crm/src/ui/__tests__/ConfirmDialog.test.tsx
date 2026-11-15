import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { ConfirmDialog } from '../ConfirmDialog'

function setup(sidePanel: boolean) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <LocaleProvider>
      <ConfirmDialog
        open
        sidePanel={sidePanel}
        title="Удалить запись?"
        description="Подтвердите удаление"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </LocaleProvider>,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('keeps the standard confirmation usable', () => {
    const { onConfirm } = setup(false)
    expect(screen.getByRole('dialog', { name: 'Удалить запись?' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
  it('supports a named side panel with working close and confirmation actions', () => {
    const { onConfirm, onCancel } = setup(true)
    expect(screen.getByRole('dialog', { name: 'Удалить запись?' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(onCancel).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
