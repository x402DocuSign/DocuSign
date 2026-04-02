/**
 * SHA-3 (Keccak-256) hash of a buffer or string
 * Node.js built-in supports SHA3-256 and SHA3-512
 */
export declare function sha3Hash(data: Buffer | string): string;
export declare function sha3HashFile(fileBuffer: Buffer): string;
export declare function sha512Hash(data: string): string;
export declare function hmac256(data: string, secret: string): string;
//# sourceMappingURL=hash.d.ts.map