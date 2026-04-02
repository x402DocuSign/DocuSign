import crypto from 'crypto'

/**
 * SHA-3 (Keccak-256) hash of a buffer or string
 * Node.js built-in supports SHA3-256 and SHA3-512
 */
export function sha3Hash(data: Buffer | string): string {
  return crypto
    .createHash('sha3-256')
    .update(data)
    .digest('hex')
}

export function sha3HashFile(fileBuffer: Buffer): string {
  return sha3Hash(fileBuffer)
}

export function sha512Hash(data: string): string {
  return crypto.createHash('sha512').update(data, 'utf8').digest('hex')
}

export function hmac256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}