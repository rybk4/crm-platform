import { useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

import { deletePhoneEdit, formatPhoneEdit } from '@/lib/validation/phoneEditing'

export function usePhoneInput(value: string, onChange: (value: string) => void, masked: boolean) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<{ cursor: number } | null>(null)

  useLayoutEffect(() => {
    if (masked && selection) {
      inputRef.current?.setSelectionRange(selection.cursor, selection.cursor)
    }
  }, [masked, selection, value])

  function apply(edit: { value: string; cursor: number }) {
    onChange(edit.value)
    setSelection({ cursor: edit.cursor })
  }

  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const raw = event.target.value
    if (!masked) return onChange(raw)
    const cursor = event.target.selectionStart ?? raw.length
    // Mobile keyboards can delete separators without emitting a keydown event.
    if (raw.length < value.length && raw.replace(/\D/g, '') === value.replace(/\D/g, '')) {
      const forward =
        'inputType' in event.nativeEvent && event.nativeEvent.inputType === 'deleteContentForward'
      apply(deletePhoneEdit(value, cursor, cursor, !forward))
      return
    }
    apply(formatPhoneEdit(raw, cursor))
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!masked || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key !== 'Backspace' && event.key !== 'Delete') return
    const input = inputRef.current
    if (!input) return
    event.preventDefault()
    apply(
      deletePhoneEdit(
        value,
        input.selectionStart ?? 0,
        input.selectionEnd ?? 0,
        event.key === 'Backspace',
      ),
    )
  }

  return { inputRef, change, keyDown }
}
