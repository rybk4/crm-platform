import type { ClientSeed } from './clients'
import { createRandom } from '../random'

const womenNames = [
  'Алина',
  'Дана',
  'Сауле',
  'Карина',
  'Юлия',
  'Диана',
  'Жанель',
  'Индира',
  'Айжан',
  'Меруерт',
  'Зарина',
  'Нурия',
  'Динара',
  'Ольга',
  'Толганай',
  'Елена',
]

const menNames = [
  'Марат',
  'Илья',
  'Тимур',
  'Алмас',
  'Ренат',
  'Артём',
  'Максим',
  'Глеб',
  'Никита',
  'Егор',
  'Антон',
  'Кирилл',
  'Данияр',
  'Санжар',
  'Игорь',
  'Алишер',
]

/** Фамилии парами: женская форма и мужская, чтобы имена были согласованы. */
const surnames: [string, string][] = [
  ['Сатпаева', 'Сатпаев'],
  ['Попова', 'Попов'],
  ['Абдуллина', 'Абдуллин'],
  ['Исаева', 'Исаев'],
  ['Марченко', 'Марченко'],
  ['Юсупова', 'Юсупов'],
  ['Байжанова', 'Байжанов'],
  ['Гусева', 'Гусев'],
  ['Родина', 'Родин'],
  ['Шарипова', 'Шарипов'],
  ['Дуйсенова', 'Дуйсенов'],
  ['Лазарева', 'Лазарев'],
  ['Каримова', 'Каримов'],
  ['Нагорная', 'Нагорный'],
  ['Омарова', 'Омаров'],
  ['Крылова', 'Крылов'],
  ['Ким', 'Ким'],
  ['Тен', 'Тен'],
  ['Швец', 'Швец'],
  ['Алтынбек', 'Алтынбек'],
]

/**
 * Помимо именных карточек нужна массовка: без неё десяток клиентов набирает
 * по сотне визитов за квартал, и сегменты вырождаются в один VIP.
 */
export function generatedSeeds(count: number, offset: number): ClientSeed[] {
  const random = createRandom(4242)
  const used = new Set<string>()
  const generated: ClientSeed[] = []

  while (generated.length < count) {
    const female = random.chance(0.7)
    const surname = random.pick(surnames)
    const name = `${random.pick(female ? womenNames : menNames)} ${female ? surname[0] : surname[1]}`
    if (used.has(name)) continue
    used.add(name)

    const index = offset + generated.length
    generated.push({
      name,
      phone: `+7702${`${1110000 + index}`.slice(-7)}`,
      email: '',
      birthday: null,
      note: '',
    })
  }

  return generated
}
