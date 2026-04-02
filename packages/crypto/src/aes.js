"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.encryptToString = encryptToString;
exports.decryptFromString = decryptFromString;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
function getKey() {
    const key = process.env.AES_ENCRYPTION_KEY;
    if (!key)
        throw new Error('AES_ENCRYPTION_KEY not set');
    return Buffer.from(key, 'hex').slice(0, KEY_LENGTH);
}
function encrypt(plaintext) {
    const key = getKey();
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return {
        ciphertext,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
    };
}
function decrypt(payload) {
    const key = getKey();
    const iv = Buffer.from(payload.iv, 'base64');
    const authTag = Buffer.from(payload.authTag, 'base64');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let plaintext = decipher.update(payload.ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
}
function encryptToString(plaintext) {
    const payload = encrypt(plaintext);
    return JSON.stringify(payload);
}
function decryptFromString(encryptedString) {
    const payload = JSON.parse(encryptedString);
    return decrypt(payload);
}
//# sourceMappingURL=aes.js.map