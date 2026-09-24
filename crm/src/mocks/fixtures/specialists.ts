import type { Specialist, WorkSchedule } from '@/modules/specialists/types'
import { branches, organization } from './organization'

interface WorkWeekOptions {
  start: string
  end: string
  daysOff: number[]
  breakStart?: string
  breakEnd?: string
}

function workWeek({ start, end, daysOff, breakStart, breakEnd }: WorkWeekOptions): WorkSchedule[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const isDayOff = daysOff.includes(weekday)

    return {
      weekday,
      is_day_off: isDayOff,
      start_time: isDayOff ? null : `${start}:00`,
      end_time: isDayOff ? null : `${end}:00`,
      break_start: isDayOff || !breakStart ? null : `${breakStart}:00`,
      break_end: isDayOff || !breakEnd ? null : `${breakEnd}:00`,
    }
  })
}

interface SpecialistSeed {
  id: number
  branch: number
  firstName: string
  lastName: string
  middleName: string
  jobTitle: string
  phone: string
  bio: string
  schedule: WorkSchedule[]
  certificates: string[]
  isActive?: boolean
}

const seeds: SpecialistSeed[] = [
  {
    id: 1,
    branch: 1,
    firstName: 'Дина',
    lastName: 'Абенова',
    middleName: 'Маратовна',
    jobTitle: 'Мастер маникюра',
    phone: '+77012223344',
    bio: 'Аппаратный маникюр, укрепление и сложный дизайн. В профессии девять лет.',
    schedule: workWeek({
      start: '09:00',
      end: '18:00',
      daysOff: [6],
      breakStart: '13:00',
      breakEnd: '14:00',
    }),
    certificates: ['Nail Master Pro, 2024', 'Аппаратный маникюр: продвинутый курс'],
  },
  {
    id: 2,
    branch: 1,
    firstName: 'Асем',
    lastName: 'Ералиева',
    middleName: 'Бекзатовна',
    jobTitle: 'Парикмахер-стилист',
    phone: '+77012223355',
    bio: 'Женские стрижки, окрашивание в технике air touch, уход за волосами.',
    schedule: workWeek({
      start: '10:00',
      end: '20:00',
      daysOff: [0],
      breakStart: '15:00',
      breakEnd: '16:00',
    }),
    certificates: ['Wella Master Colorist, 2025'],
  },
  {
    id: 3,
    branch: 1,
    firstName: 'Мария',
    lastName: 'Ким',
    middleName: 'Сергеевна',
    jobTitle: 'Косметолог',
    phone: '+77012223366',
    bio: 'Чистки, пилинги и уходовые протоколы. Медицинское образование.',
    schedule: workWeek({ start: '09:00', end: '17:00', daysOff: [5, 6] }),
    certificates: ['Сертификат косметолога-эстетиста', 'Пилинги: базовый протокол'],
  },
  {
    id: 4,
    branch: 1,
    firstName: 'Тимур',
    lastName: 'Жаксылыков',
    middleName: 'Ерланович',
    jobTitle: 'Барбер',
    phone: '+77012223377',
    bio: 'Мужские стрижки, оформление бороды, камуфляж седины.',
    schedule: workWeek({ start: '11:00', end: '21:00', daysOff: [1] }),
    certificates: ['Barber Academy, 2023'],
  },
  {
    id: 5,
    branch: 2,
    firstName: 'Айсулу',
    lastName: 'Нурпеисова',
    middleName: 'Талгатовна',
    jobTitle: 'Массажист',
    phone: '+77012223388',
    bio: 'Классический и спортивный массаж, работа с осанкой.',
    schedule: workWeek({
      start: '10:00',
      end: '19:00',
      daysOff: [6],
      breakStart: '14:00',
      breakEnd: '15:00',
    }),
    certificates: ['Спортивный массаж, 2024'],
  },
  {
    id: 6,
    branch: 2,
    firstName: 'Ольга',
    lastName: 'Демченко',
    middleName: 'Петровна',
    jobTitle: 'Мастер по бровям',
    phone: '+77012223399',
    bio: 'Коррекция и окрашивание бровей, ламинирование ресниц.',
    schedule: workWeek({ start: '09:00', end: '18:00', daysOff: [0, 6] }),
    certificates: [],
    isActive: false,
  },
]

export const specialists: Specialist[] = seeds.map((seed) => {
  const branch = branches.find((item) => item.id === seed.branch) ?? branches[0]

  return {
    id: seed.id,
    branch: branch.id,
    branch_name: branch.name,
    organization_id: organization.id,
    organization_name: organization.name,
    first_name: seed.firstName,
    last_name: seed.lastName,
    middle_name: seed.middleName,
    full_name: `${seed.lastName} ${seed.firstName} ${seed.middleName}`.trim(),
    job_title: seed.jobTitle,
    phone_number: seed.phone,
    photo_url: '',
    bio: seed.bio,
    is_active: seed.isActive ?? true,
    services_count: 0,
    certificates: seed.certificates.map((title, index) => ({
      id: seed.id * 10 + index,
      title,
      image_url: `https://example.com/certificates/${seed.id}-${index}.jpg`,
      issued_at: null,
      position: index,
    })),
    schedule: seed.schedule,
  }
})
