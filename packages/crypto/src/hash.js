"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha3Hash = sha3Hash;
exports.sha3HashFile = sha3HashFile;
exports.sha512Hash = sha512Hash;
exports.hmac256 = hmac256;
const crypto_1 = __importDefault(require("crypto"));
/**
 * SHA-3 (Keccak-256) hash of a buffer or string
 * Node.js built-in supports SHA3-256 and SHA3-512
 */
function sha3Hash(data) {
    return crypto_1.default
        .createHash('sha3-256')
        .update(data)
        .digest('hex');
}
function sha3HashFile(fileBuffer) {
    return sha3Hash(fileBuffer);
}
function sha512Hash(data) {
    return crypto_1.default.createHash('sha512').update(data, 'utf8').digest('hex');
}
function hmac256(data, secret) {
    return crypto_1.default.createHmac('sha256', secret).update(data).digest('hex');
}
//# sourceMappingURL=hash.js.map