import Redis from 'ioredis'

let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
      lazyConnect: false,
    })

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message)
    })

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully')
    })
  }
  return redisClient
}

// ─── Session helpers ───────────────────────────────────────────

export async function setSession(key: string, value: object, ttlSeconds = 900) {
  const redis = getRedis()
  await redis.setex(`session:${key}`, ttlSeconds, JSON.stringify(value))
}

export async function getSession<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  const data = await redis.get(`session:${key}`)
  return data ? JSON.parse(data) : null
}

export async function deleteSession(key: string) {
  const redis = getRedis()
  await redis.del(`session:${key}`)
}

// ─── Idempotency helpers ───────────────────────────────────────

export async function setIdempotency(key: string, value: object, ttlSeconds = 86400) {
  const redis = getRedis()
  await redis.setex(`idempotency:${key}`, ttlSeconds, JSON.stringify(value))
}

export async function getIdempotency<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  const data = await redis.get(`idempotency:${key}`)
  return data ? JSON.parse(data) : null
}

// ─── Blacklist token (logout) ──────────────────────────────────

export async function blacklistToken(token: string, ttlSeconds: number) {
  const redis = getRedis()
  await redis.setex(`blacklist:${token}`, ttlSeconds, '1')
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const redis = getRedis()
  const val = await redis.get(`blacklist:${token}`)
  return val !== null
}

// ─── Rate limit key ────────────────────────────────────────────

export function rateLimitKey(prefix: string, identifier: string) {
  return `ratelimit:${prefix}:${identifier}`
}