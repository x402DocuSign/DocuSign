import Redis from 'ioredis';
export declare function getRedis(): Redis;
export declare function setSession(key: string, value: object, ttlSeconds?: number): Promise<void>;
export declare function getSession<T>(key: string): Promise<T | null>;
export declare function deleteSession(key: string): Promise<void>;
export declare function setIdempotency(key: string, value: object, ttlSeconds?: number): Promise<void>;
export declare function getIdempotency<T>(key: string): Promise<T | null>;
export declare function blacklistToken(token: string, ttlSeconds: number): Promise<void>;
export declare function isTokenBlacklisted(token: string): Promise<boolean>;
export declare function rateLimitKey(prefix: string, identifier: string): string;
//# sourceMappingURL=redis.d.ts.map