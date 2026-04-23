import crypto from 'crypto'

export const generateId = (prefix: string): string => {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(4).toString('hex')
  return `${prefix}_${timestamp}_${random}`
}

export const today = (): string => new Date().toISOString().split('T')[0]
