export function parseApiErrors(payload: unknown): string[] {
  const messages: string[] = []
  const seenObjects = new WeakSet<object>()

  function visit(value: unknown) {
    if (typeof value === 'string') {
      const message = value.trim()
      if (message && !messages.includes(message)) messages.push(message)
      return
    }

    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }

    if (typeof value !== 'object' || value === null || seenObjects.has(value)) return

    seenObjects.add(value)
    Object.values(value).forEach(visit)
  }

  visit(payload)
  return messages
}
