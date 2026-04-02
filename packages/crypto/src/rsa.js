"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsaSign = rsaSign;
exports.rsaVerify = rsaVerify;
exports.generateRsaKeyPair = generateRsaKeyPair;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getPrivateKey() {
    const keyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
    return fs_1.default.readFileSync(path_1.default.resolve(keyPath), 'utf8');
}
function getPublicKey() {
    const keyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';
    return fs_1.default.readFileSync(path_1.default.resolve(keyPath), 'utf8');
}
/**
 * Sign data with RSA-2048 private key, returns base64 signature
 */
function rsaSign(data) {
    const privateKey = getPrivateKey();
    const sign = crypto_1.default.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
}
/**
 * Verify RSA-2048 signature with public key
 */
function rsaVerify(data, signature) {
    try {
        const publicKey = getPublicKey();
        const verify = crypto_1.default.createVerify('RSA-SHA256');
        verify.update(data);
        verify.end();
        return verify.verify(publicKey, signature, 'base64');
    }
    catch {
        return false;
    }
}
/**
 * Generate a new RSA-2048 key pair programmatically
 */
function generateRsaKeyPair() {
    const { privateKey, publicKey } = crypto_1.default.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { privateKey, publicKey };
}
//# sourceMappingURL=rsa.js.map