"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KeyEncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyEncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const client_kms_1 = require("@aws-sdk/client-kms");
let KeyEncryptionService = KeyEncryptionService_1 = class KeyEncryptionService {
    constructor() {
        this.logger = new common_1.Logger(KeyEncryptionService_1.name);
        this.kmsClient = null;
        if (process.env.AWS_REGION && process.env.KMS_KEY_ID) {
            this.kmsClient = new client_kms_1.KMSClient({
                region: process.env.AWS_REGION,
            });
            this.logger.log('AWS KMS initialized');
        }
        else {
            this.logger.warn('AWS KMS not configured, using local encryption (NOT FOR PRODUCTION)');
        }
        this.localEncryptionKey = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!', 'utf-8').slice(0, 32);
    }
    async encryptPrivateKey(privateKey) {
        try {
            const keyBuffer = typeof privateKey === 'string'
                ? Buffer.from(privateKey, 'base64')
                : Buffer.from(privateKey);
            if (this.kmsClient && process.env.KMS_KEY_ID) {
                const command = new client_kms_1.EncryptCommand({
                    KeyId: process.env.KMS_KEY_ID,
                    Plaintext: keyBuffer,
                });
                const response = await this.kmsClient.send(command);
                const encrypted = Buffer.from(response.CiphertextBlob).toString('base64');
                return {
                    encrypted: `kms:v1:${encrypted}`,
                    method: 'KMS',
                    keyId: process.env.KMS_KEY_ID,
                };
            }
            else {
                const encrypted = this.localEncrypt(keyBuffer);
                return {
                    encrypted: `local:v1:${encrypted}`,
                    method: 'LOCAL',
                };
            }
        }
        catch (error) {
            this.logger.error(`Encryption failed: ${error.message}`);
            throw new Error('Failed to encrypt private key');
        }
    }
    async decryptPrivateKey(encryptedData) {
        try {
            const [method, version, data] = encryptedData.split(':');
            if (method === 'kms' && version === 'v1') {
                if (!this.kmsClient) {
                    throw new Error('KMS not configured');
                }
                const command = new client_kms_1.DecryptCommand({
                    CiphertextBlob: Buffer.from(data, 'base64'),
                });
                const response = await this.kmsClient.send(command);
                return new Uint8Array(response.Plaintext);
            }
            else if (method === 'local' && version === 'v1') {
                return new Uint8Array(this.localDecrypt(data));
            }
            else {
                throw new Error(`Unknown encryption method: ${method}`);
            }
        }
        catch (error) {
            this.logger.error(`Decryption failed: ${error.message}`);
            throw new Error('Failed to decrypt private key');
        }
    }
    async rotateEncryption(oldEncrypted, newMethod) {
        try {
            const decrypted = await this.decryptPrivateKey(oldEncrypted);
            const result = await this.encryptPrivateKey(decrypted);
            return {
                ...result,
                rotatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Key rotation failed: ${error.message}`);
            throw error;
        }
    }
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('base64');
    }
    async createKeyBackup(encryptedKey, userId) {
        const backupId = crypto.randomBytes(16).toString('hex');
        const shards = [
            `shard1:${backupId}:${encryptedKey.substring(0, 20)}`,
            `shard2:${backupId}:${encryptedKey.substring(20, 40)}`,
            `shard3:${backupId}:${encryptedKey.substring(40)}`,
        ];
        this.logger.log(`Created key backup ${backupId} for user ${userId}`);
        return {
            backupId,
            shards,
            threshold: 2,
        };
    }
    localEncrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.localEncryptionKey, iv);
        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final(),
        ]);
        const combined = Buffer.concat([iv, encrypted]);
        return combined.toString('base64');
    }
    localDecrypt(encryptedData) {
        const combined = Buffer.from(encryptedData, 'base64');
        const iv = combined.slice(0, 16);
        const encrypted = combined.slice(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.localEncryptionKey, iv);
        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);
    }
    async validateEncryption() {
        try {
            const testData = crypto.randomBytes(32);
            const encrypted = await this.encryptPrivateKey(testData);
            const decrypted = await this.decryptPrivateKey(encrypted.encrypted);
            const isValid = Buffer.from(testData).equals(Buffer.from(decrypted));
            return {
                method: encrypted.method,
                isValid,
                details: {
                    keyId: encrypted.keyId,
                    encryptionWorks: isValid,
                },
            };
        }
        catch (error) {
            return {
                method: 'LOCAL',
                isValid: false,
                details: { error: error.message },
            };
        }
    }
};
exports.KeyEncryptionService = KeyEncryptionService;
exports.KeyEncryptionService = KeyEncryptionService = KeyEncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KeyEncryptionService);
//# sourceMappingURL=keyEncryption.js.map