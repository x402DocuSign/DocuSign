import Redis from 'ioredis'

let redisClient: Redis | null = null
let redisAvailable = false

export function getRedis(): Redis {
  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) {
            console.warn('[Redis] Redis unavailable after 3 retries, will use in-memory fallback')
            redisAvailable = false
            return null // Stop retrying
          }
          return Math.min(times * 100, 3000)
        },
        lazyConnect: false,
        enableReadyCheck: false,
        enableOfflineQueue: false,
      })

      redisClient.on('error', (err: Error) => {
        redisAvailable = false
        console.warn('[Redis] Connection error (will use fallback):', err.message)
      })

      redisClient.on('connect', () => {
        redisAvailable = true
        console.log('[Redis] Connected successfully')
      })
    } catch (err) {
      console.warn('[Redis] Failed to create client, will use in-memory fallback')
      redisAvailable = false
    }
  }
  return redisClient as Redis
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null
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