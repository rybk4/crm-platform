import { describe, expect, it } from 'vitest'

import {
  defaultSchedule,
  emptySpecialistForm,
  isSpecialistFormValid,
  scheduleDayLabel,
  specialistInitials,
  specialistToForm,
  toSpecialistPayload,
} from './model'
import type { Specialist } from './types'

function makeSpecialist(overrides: Partial<Specialist> = {}): Specialist {
  return {
    id: 1,
    branch: 2,
    branch_name: 'Центр',
    organization_id: 3,
    organization_name: 'Салон',
    first_name: 'Айдана',
    last_name: 'Серик',
    middle_name: '',
    full_name: 'Серик Айдана',
    job_title: 'Мастер',
    phone_number: '+77001234567',
    photo_url: '',
    bio: '',
    is_active: true,
    services_count: 4,
    certificates: [],
    schedule: [],
    ...overrides,
  }
}

describe('defaultSchedule', () => {
  it('делает воскресенье выходным, остальные дни рабочими', () => {
    const schedule = defaultSchedule()

    expect(schedule).toHaveLength(7)
    expect(schedule[6]).toMatchObject({ is_day_off: true, start_time: null, end_time: null })
    expect(schedule[0]).toMatchObject({ is_day_off: false, start_time: '09:00', end_time: '18:00' })
  })
})

describe('emptySpecialistForm', () => {
  it('подставляет филиал и активность по умолчанию', () => {
    expect(emptySpecialistForm(7)).toMatchObject({ branch: 7, is_active: true, certificates: [] })
  })
})

describe('specialistToForm', () => {
  it('обрезает секунды во времени расписания', () => {
    const form = specialistToForm(
      makeSpecialist({
        schedule: [
          {
            weekday: 0,
            is_day_off: false,
            start_time: '10:30:00',
            end_time: '19:00:00',
            break_start: '13:00:00',
            break_end: null,
          },
        ],
      }),
    )

    expect(form.schedule[0]).toMatchObject({
      start_time: '10:30',
      end_time: '19:00',
      break_start: '13:00',
      break_end: null,
    })
  })

  it('дополняет недостающие дни значениями по умолчанию', () => {
    const form = specialistToForm(makeSpecialist({ schedule: [] }))

    expect(form.schedule).toHaveLength(7)
  })

  it('копирует сертификаты, не разделяя ссылки с исходником', () => {
    const specialist = makeSpecialist({
      certificates: [
        { id: 5, title: 'Диплом', image_url: 'https://x/1.png', issued_at: null, position: 0 },
      ],
    })
    const form = specialistToForm(specialist)

    form.certificates[0].title = 'Изменено'

    expect(specialist.certificates[0].title).toBe('Диплом')
  })
})

describe('toSpecialistPayload', () => {
  it('выкидывает незаполненные сертификаты', () => {
    const payload = toSpecialistPayload({
      ...emptySpecialistForm(1),
      certificates: [
        { title: 'Диплом', image_url: 'https://x/1.png', issued_at: null, position: 0 },
        { title: '  ', image_url: '', issued_at: null, position: 1 },
        { title: 'Без картинки', image_url: '   ', issued_at: null, position: 2 },
      ],
    })

    expect(payload.certificates).toHaveLength(1)
    expect(payload.certificates[0].title).toBe('Диплом')
  })
})

describe('isSpecialistFormValid', () => {
  it('требует филиал, имя и фамилию', () => {
    const base = emptySpecialistForm(1)

    expect(isSpecialistFormValid(base)).toBe(false)
    expect(isSpecialistFormValid({ ...base, first_name: 'Айдана' })).toBe(false)
    expect(isSpecialistFormValid({ ...base, first_name: 'Айдана', last_name: 'Серик' })).toBe(true)
  })

  it('не принимает пробелы вместо имени', () => {
    const base = emptySpecialistForm(1)

    expect(isSpecialistFormValid({ ...base, first_name: '  ', last_name: '  ' })).toBe(false)
  })

  it('не принимает форму без филиала', () => {
    const base = emptySpecialistForm(0)

    expect(isSpecialistFormValid({ ...base, first_name: 'Айдана', last_name: 'Серик' })).toBe(false)
  })
})

describe('specialistInitials', () => {
  it('берёт по первой букве имени и фамилии', () => {
    expect(specialistInitials(makeSpecialist())).toBe('АС')
  })

  it('не падает на пустых полях', () => {
    expect(specialistInitials(makeSpecialist({ first_name: '', last_name: '' }))).toBe('')
  })
})

describe('scheduleDayLabel', () => {
  it('показывает интервал рабочего дня', () => {
    const label = scheduleDayLabel({
      weekday: 0,
      is_day_off: false,
      start_time: '09:00:00',
      end_time: '18:00:00',
      break_start: null,
      break_end: null,
    })

    expect(label).toBe('09:00–18:00')
  })

  it('для выходного не возвращает интервал', () => {
    const label = scheduleDayLabel({
      weekday: 6,
      is_day_off: true,
      start_time: null,
      end_time: null,
      break_start: null,
      break_end: null,
    })

    expect(label).toBeNull()
  })
})
