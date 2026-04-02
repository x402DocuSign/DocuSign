"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = getRedis;
exports.setSession = setSession;
exports.getSession = getSession;
exports.deleteSession = deleteSession;
exports.setIdempotency = setIdempotency;
exports.getIdempotency = getIdempotency;
exports.blacklistToken = blacklistToken;
exports.isTokenBlacklisted = isTokenBlacklisted;
exports.rateLimitKey = rateLimitKey;
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient = null;
function getRedis() {
    if (!redisClient) {
        redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 100, 3000),
            lazyConnect: false,
        });
        redisClient.on('error', (err) => {
            console.error('[Redis] Connection error:', err.message);
        });
        redisClient.on('connect', () => {
            console.log('[Redis] Connected successfully');
        });
    }
    return redisClient;
}
// ─── Session helpers ───────────────────────────────────────────
async function setSession(key, value, ttlSeconds = 900) {
    const redis = getRedis();
    await redis.setex(`session:${key}`, ttlSeconds, JSON.stringify(value));
}
async function getSession(key) {
    const redis = getRedis();
    const data = await redis.get(`session:${key}`);
    return data ? JSON.parse(data) : null;
}
async function deleteSession(key) {
    const redis = getRedis();
    await redis.del(`session:${key}`);
}
// ─── Idempotency helpers ───────────────────────────────────────
async function setIdempotency(key, value, ttlSeconds = 86400) {
    const redis = getRedis();
    await redis.setex(`idempotency:${key}`, ttlSeconds, JSON.stringify(value));
}
async function getIdempotency(key) {
    const redis = getRedis();
    const data = await redis.get(`idempotency:${key}`);
    return data ? JSON.parse(data) : null;
}
// ─── Blacklist token (logout) ──────────────────────────────────
async function blacklistToken(token, ttlSeconds) {
    const redis = getRedis();
    await redis.setex(`blacklist:${token}`, ttlSeconds, '1');
}
async function isTokenBlacklisted(token) {
    const redis = getRedis();
    const val = await redis.get(`blacklist:${token}`);
    return val !== null;
}
// ─── Rate limit key ────────────────────────────────────────────
function rateLimitKey(prefix, identifier) {
    return `ratelimit:${prefix}:${identifier}`;
}
//# sourceMappingURL=redis.js.map