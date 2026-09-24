import type { Client } from '@/modules/clients/types'
import { generatedSeeds } from './clientNames'
import { organization } from './organization'

export interface ClientSeed {
  name: string
  phone: string
  email: string
  birthday: string | null
  note: string
}

const seeds: ClientSeed[] = [
  {
    name: 'Алия Нурланова',
    phone: '+77011110001',
    email: 'aliya@example.kz',
    birthday: '1993-04-12',
    note: 'Аллергия на ацетон.',
  },
  {
    name: 'Сергей Ким',
    phone: '+77011110002',
    email: 'sergey.kim@example.kz',
    birthday: '1988-11-03',
    note: '',
  },
  {
    name: 'Гульнара Абдиева',
    phone: '+77011110003',
    email: 'gulnara@example.kz',
    birthday: '1979-07-21',
    note: 'Просит тёплую воду.',
  },
  {
    name: 'Данияр Оспанов',
    phone: '+77011110004',
    email: '',
    birthday: null,
    note: 'Приходит после работы.',
  },
  {
    name: 'Екатерина Лебедева',
    phone: '+77011110005',
    email: 'kate.l@example.kz',
    birthday: '1996-01-30',
    note: '',
  },
  {
    name: 'Мадина Сейтказы',
    phone: '+77011110006',
    email: 'madina@example.kz',
    birthday: '1991-09-08',
    note: 'Любит спокойную музыку.',
  },
  { name: 'Арман Бейсенов', phone: '+77011110007', email: '', birthday: '1985-03-17', note: '' },
  {
    name: 'Ирина Волкова',
    phone: '+77011110008',
    email: 'irina.v@example.kz',
    birthday: '1990-12-02',
    note: 'Записывается только на утро.',
  },
  {
    name: 'Жанна Куанышева',
    phone: '+77011110009',
    email: 'zhanna@example.kz',
    birthday: '1994-06-25',
    note: '',
  },
  {
    name: 'Олег Панов',
    phone: '+77011110010',
    email: '',
    birthday: null,
    note: 'Опаздывает на 10 минут.',
  },
  {
    name: 'Камила Ахметова',
    phone: '+77011110011',
    email: 'kamila@example.kz',
    birthday: '1999-02-14',
    note: '',
  },
  { name: 'Нурлан Тлеубаев', phone: '+77011110012', email: '', birthday: '1982-08-19', note: '' },
  {
    name: 'Виктория Соколова',
    phone: '+77011110013',
    email: 'vika@example.kz',
    birthday: '1997-05-06',
    note: 'Постоянный клиент с открытия.',
  },
  {
    name: 'Асель Жумабаева',
    phone: '+77011110014',
    email: 'asel.zh@example.kz',
    birthday: '1992-10-11',
    note: '',
  },
  { name: 'Павел Морозов', phone: '+77011110015', email: '', birthday: null, note: '' },
  {
    name: 'Лаура Ибрагимова',
    phone: '+77011110016',
    email: 'laura@example.kz',
    birthday: '1995-03-28',
    note: 'Чувствительная кожа.',
  },
  { name: 'Ерлан Садыков', phone: '+77011110017', email: '', birthday: '1987-01-09', note: '' },
  {
    name: 'Наталья Гончарова',
    phone: '+77011110018',
    email: 'natalia@example.kz',
    birthday: '1983-07-04',
    note: '',
  },
  {
    name: 'Сабина Тураров',
    phone: '+77011110019',
    email: 'sabina@example.kz',
    birthday: '2000-09-16',
    note: 'Студентка, скидка 10%.',
  },
  { name: 'Дмитрий Орлов', phone: '+77011110020', email: '', birthday: null, note: '' },
  {
    name: 'Айдана Кусаинова',
    phone: '+77011110021',
    email: 'aidana@example.kz',
    birthday: '1998-11-22',
    note: '',
  },
  { name: 'Рустам Алиев', phone: '+77011110022', email: '', birthday: '1986-04-30', note: '' },
  {
    name: 'Светлана Белова',
    phone: '+77011110023',
    email: 'svetlana@example.kz',
    birthday: '1975-12-18',
    note: 'Приводит дочь.',
  },
  { name: 'Жандос Мухамедов', phone: '+77011110024', email: '', birthday: null, note: '' },
  {
    name: 'Анна Ковалёва',
    phone: '+77011110025',
    email: 'anna.k@example.kz',
    birthday: '1994-08-07',
    note: '',
  },
  {
    name: 'Бекзат Сериков',
    phone: '+77011110026',
    email: '',
    birthday: '1991-02-23',
    note: 'Новый клиент по рекомендации.',
  },
]

const allSeeds = [...seeds, ...generatedSeeds(150, seeds.length)]

/** Агрегаты (визиты, суммы, сегмент) считает `db`: они зависят от записей. */
export const clients: Client[] = allSeeds.map((seed, index) => ({
  id: index + 1,
  organization_id: organization.id,
  name: seed.name,
  phone_number: seed.phone,
  email: seed.email,
  birthday: seed.birthday,
  note: seed.note,
  segment: 'new',
  visits_count: 0,
  total_spent: '0',
  average_check: '0',
  currency: organization.currency,
  first_visit_at: null,
  last_visit_at: null,
  created_at: '2026-03-01T08:00:00.000Z',
}))

const NEWCOMER_COUNT = 45
const NEWCOMER_WINDOW_DAYS = 75

/**
 * Новички заходят в базу не одной волной, а равномерно за последние
 * `NEWCOMER_WINDOW_DAYS` дней: иначе показатель «новые клиенты» скачет.
 * Значение — день первого появления в виде смещения от сегодняшнего дня.
 */
export const newcomerEntryDay = new Map<number, number>(
  clients
    .slice(-NEWCOMER_COUNT)
    .map((client, index) => [
      client.id,
      -NEWCOMER_WINDOW_DAYS + Math.floor((index * NEWCOMER_WINDOW_DAYS) / NEWCOMER_COUNT),
    ]),
)
