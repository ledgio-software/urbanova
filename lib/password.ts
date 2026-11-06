import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

// Partner login passwords. scrypt from Node's crypto — no extra dependency.
// Stored as "scrypt$<salt b64>$<key b64>".

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, key] = stored.split('$')
  if (algorithm !== 'scrypt' || !salt || !key) return false
  const expected = Buffer.from(key, 'base64')
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** One-time password the admin shares with a new partner; they must change it on first login. */
export function generateTempPassword(): string {
  return randomBytes(9).toString('base64url') // 12 characters
}

export const MIN_PASSWORD_LENGTH = 10
