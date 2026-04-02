#!/usr/bin/env node
const { generateKeyPairSync, randomBytes } = require('crypto')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..') // apps/api
const keysDir = path.join(projectRoot, 'keys')
fs.mkdirSync(keysDir, { recursive: true })

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

fs.writeFileSync(path.join(keysDir, 'jwt_private.pem'), privateKey, { mode: 0o600 })
fs.writeFileSync(path.join(keysDir, 'jwt_public.pem'), publicKey, { mode: 0o600 })

const aesKey = randomBytes(32).toString('hex')
const webhookSecret = randomBytes(32).toString('hex')

const envPath = path.join(projectRoot, '.env')
let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''

// Replace existing inline JWT private/public PEM block (if present) up to JWT_EXPIRES_IN=
const jwtBlockRegex = /JWT_PRIVATE_KEY_PATH=[\s\S]*?JWT_EXPIRES_IN=/m
if (jwtBlockRegex.test(env)) {
  env = env.replace(jwtBlockRegex, `JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem\nJWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem\n\nJWT_EXPIRES_IN=`)
} else if (!/JWT_PRIVATE_KEY_PATH=/m.test(env)) {
  // append if not present
  env += `\nJWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem\nJWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem\nJWT_EXPIRES_IN=15m\n`
}

// AES_ENCRYPTION_KEY
if (/^AES_ENCRYPTION_KEY=.*$/m.test(env)) {
  env = env.replace(/^AES_ENCRYPTION_KEY=.*$/m, `AES_ENCRYPTION_KEY=${aesKey}`)
} else {
  env += `\nAES_ENCRYPTION_KEY=${aesKey}\n`
}

// WEBHOOK_SECRET
if (/^WEBHOOK_SECRET=.*$/m.test(env)) {
  env = env.replace(/^WEBHOOK_SECRET=.*$/m, `WEBHOOK_SECRET=${webhookSecret}`)
} else {
  env += `\nWEBHOOK_SECRET=${webhookSecret}\n`
}

fs.writeFileSync(envPath, env, 'utf8')

console.log('WROTE_KEYS', keysDir)
console.log('PRIVATE_KEY=keys/jwt_private.pem')
console.log('PUBLIC_KEY=keys/jwt_public.pem')
console.log('AES_ENCRYPTION_KEY=' + aesKey)
console.log('WEBHOOK_SECRET=' + webhookSecret)
