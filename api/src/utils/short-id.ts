import { randomBytes } from 'node:crypto'

// 32 characters: digits 2-9 + letters A-Z, excluding ambiguous I, O, 0, 1
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

function generateCode(): string {
  return Array.from(randomBytes(4), (byte) => {
    // byte & 0x1f maps 0-255 → 0-31 with no modulo bias (256 / 32 = 8 exactly)
    return CHARSET[byte & 0x1f] ?? '2'
  }).join('')
}

export function generateBillId(): string {
  return `B-${generateCode()}`
}

export function generateOrderId(): string {
  return `O-${generateCode()}`
}
