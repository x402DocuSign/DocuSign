import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

function getPrivateKey(): string {
  const keyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem'
  return fs.readFileSync(path.resolve(keyPath), 'utf8')
}

function getPublicKey(): string {
  const keyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem'
  return fs.readFileSync(path.resolve(keyPath), 'utf8')
}

/**
 * Sign data with RSA-2048 private key, returns base64 signature
 */
export function rsaSign(data: string): string {
  const privateKey = getPrivateKey()
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(data)
  sign.end()
  return sign.sign(privateKey, 'base64')
}

/**
 * Verify RSA-2048 signature with public key
 */
export function rsaVerify(data: string, signature: string): boolean {
  try {
    const publicKey = getPublicKey()
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(data)
    verify.end()
    return verify.verify(publicKey, signature, 'base64')
  } catch {
    return false
  }
}

/**
 * Generate a new RSA-2048 key pair programmatically
 */
export function generateRsaKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  return { privateKey, publicKey }
}