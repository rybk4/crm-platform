import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { JournalToolbar } from '../components/JournalToolbar'

function setup() {
  const callbacks = {
    onDateChange: vi.fn(),
    onRangeChange: vi.fn(),
    onShift: vi.fn(),
    onToday: vi.fn(),
    onSpecialistChange: vi.fn(),
    onFilter: vi.fn(),
    onStepChange: vi.fn(),
  }
  render(
    <LocaleProvider>
      <JournalToolbar
        date="2026-10-21"
        range={null}
        isToday={false}
        specialists={[]}
        specialist={null}
        step={30}
        {...callbacks}
      />
    </LocaleProvider>,
  )
  return callbacks
}

describe('JournalToolbar', () => {
  it('names filters accessibly and shows their default selection', () => {
    setup()
    expect(screen.getByRole('combobox', { name: 'Специалист' })).toHaveTextContent(
      'Все специалисты',
    )
    expect(screen.getByRole('button', { name: 'Фильтр' })).toBeVisible()
    expect(screen.queryByRole('combobox', { name: 'Статус' })).not.toBeInTheDocument()
  })

  it('keeps date navigation and view switching functional', () => {
    const callbacks = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Предыдущий день' }))
    fireEvent.click(screen.getByRole('button', { name: 'Следующий день' }))
    fireEvent.click(screen.getByRole('button', { name: 'Сегодня' }))
    fireEvent.click(screen.getByRole('button', { name: 'Фильтр' }))

    expect(callbacks.onShift.mock.calls).toEqual([[-1], [1]])
    expect(callbacks.onToday).toHaveBeenCalledOnce()
    expect(callbacks.onFilter).toHaveBeenCalledOnce()
  })

  it('selects a date from the calendar', () => {
    const { onDateChange } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Выберите дату или период' }))
    fireEvent.click(screen.getByRole('button', { name: '22 октября 2026 г.' }))
    expect(onDateChange).toHaveBeenCalledExactlyOnceWith('2026-10-22')
  })
})
