/** Django uses UUIDs; demo fixtures keep compact numeric ids. */
export type EntityId = string | number

export function parseEntityId(value: string): EntityId {
  return /^\d+$/.test(value) ? Number(value) : value
}

export function sameEntityId(left: EntityId | null, right: EntityId | null) {
  return left !== null && right !== null && String(left) === String(right)
}
