export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
    authTag: string;
}
export declare function encrypt(plaintext: string): EncryptedPayload;
export declare function decrypt(payload: EncryptedPayload): string;
export declare function encryptToString(plaintext: string): string;
export declare function decryptFromString(encryptedString: string): string;
//# sourceMappingURL=aes.d.ts.map