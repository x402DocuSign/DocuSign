/**
 * Sign data with RSA-2048 private key, returns base64 signature
 */
export declare function rsaSign(data: string): string;
/**
 * Verify RSA-2048 signature with public key
 */
export declare function rsaVerify(data: string, signature: string): boolean;
/**
 * Generate a new RSA-2048 key pair programmatically
 */
export declare function generateRsaKeyPair(): {
    privateKey: string;
    publicKey: string;
};
//# sourceMappingURL=rsa.d.ts.map