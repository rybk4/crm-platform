/**
 * Детерминированный генератор: демо-данные должны быть одинаковыми при каждой
 * перезагрузке, иначе скриншоты и цифры в разделах расходятся.
 */
export function createRandom(seed: number) {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646

  function next() {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }

  return {
    next,
    int(min: number, max: number) {
      return min + Math.floor(next() * (max - min + 1))
    },
    pick<T>(items: readonly T[]) {
      return items[Math.floor(next() * items.length)]
    },
    chance(probability: number) {
      return next() < probability
    },
  }
}

export type Random = ReturnType<typeof createRandom>
