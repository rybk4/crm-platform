import type { Service } from '@/modules/services/types'
import { branches, organization } from './organization'
import { specialists } from './specialists'

interface ServiceSeed {
  specialist: number
  name: string
  description: string
  duration: number
  price: number
  isActive?: boolean
}

const seeds: ServiceSeed[] = [
  {
    specialist: 1,
    name: 'Маникюр с покрытием',
    description: 'Аппаратный маникюр и гель-лак',
    duration: 90,
    price: 9000,
  },
  {
    specialist: 1,
    name: 'Маникюр без покрытия',
    description: 'Обработка кутикулы и формы',
    duration: 60,
    price: 6000,
  },
  {
    specialist: 1,
    name: 'Наращивание ногтей',
    description: 'Гелевое наращивание и дизайн',
    duration: 150,
    price: 18000,
  },
  {
    specialist: 2,
    name: 'Женская стрижка',
    description: 'Мытьё, стрижка и укладка',
    duration: 60,
    price: 11000,
  },
  {
    specialist: 2,
    name: 'Окрашивание air touch',
    description: 'Сложное окрашивание с тонированием',
    duration: 210,
    price: 45000,
  },
  {
    specialist: 2,
    name: 'Укладка',
    description: 'Локоны или гладкая укладка',
    duration: 45,
    price: 8000,
  },
  {
    specialist: 3,
    name: 'Чистка лица',
    description: 'Комбинированная чистка с уходом',
    duration: 90,
    price: 16000,
  },
  {
    specialist: 3,
    name: 'Пилинг',
    description: 'Поверхностный пилинг по протоколу',
    duration: 60,
    price: 14000,
  },
  {
    specialist: 3,
    name: 'Уходовая процедура',
    description: 'Уход по типу кожи с массажем',
    duration: 75,
    price: 12500,
  },
  {
    specialist: 4,
    name: 'Мужская стрижка',
    description: 'Машинка и ножницы, укладка',
    duration: 45,
    price: 7000,
  },
  {
    specialist: 4,
    name: 'Стрижка бороды',
    description: 'Оформление контура и уход',
    duration: 30,
    price: 5000,
  },
  {
    specialist: 4,
    name: 'Стрижка и борода',
    description: 'Комплекс со скидкой',
    duration: 75,
    price: 10500,
  },
  {
    specialist: 5,
    name: 'Классический массаж',
    description: 'Общий массаж тела, 60 минут',
    duration: 60,
    price: 15000,
  },
  {
    specialist: 5,
    name: 'Массаж спины',
    description: 'Работа с воротниковой зоной',
    duration: 40,
    price: 10000,
  },
  {
    specialist: 6,
    name: 'Коррекция бровей',
    description: 'Коррекция и окрашивание',
    duration: 45,
    price: 7500,
    isActive: false,
  },
]

export const services: Service[] = seeds.map((seed, index) => {
  const specialist = specialists.find((item) => item.id === seed.specialist) ?? specialists[0]
  const branch = branches.find((item) => item.id === specialist.branch) ?? branches[0]

  return {
    id: index + 1,
    specialist: specialist.id,
    specialist_name: specialist.full_name,
    branch_id: branch.id,
    branch_name: branch.name,
    organization_id: organization.id,
    name: seed.name,
    description: seed.description,
    duration_minutes: seed.duration,
    price: String(seed.price),
    currency: organization.currency,
    is_active: seed.isActive ?? true,
  }
})
