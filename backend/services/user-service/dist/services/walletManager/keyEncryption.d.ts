export declare class KeyEncryptionService {
    private logger;
    private kmsClient;
    private localEncryptionKey;
    constructor();
    encryptPrivateKey(privateKey: Uint8Array | string): Promise<{
        encrypted: string;
        method: 'KMS' | 'LOCAL';
        keyId?: string;
    }>;
    decryptPrivateKey(encryptedData: string): Promise<Uint8Array>;
    rotateEncryption(oldEncrypted: string, newMethod?: 'KMS' | 'LOCAL'): Promise<{
        encrypted: string;
        method: 'KMS' | 'LOCAL';
        rotatedAt: Date;
    }>;
    generateEncryptionKey(): string;
    createKeyBackup(encryptedKey: string, userId: string): Promise<{
        backupId: string;
        shards: string[];
        threshold: number;
    }>;
    private localEncrypt;
    private localDecrypt;
    validateEncryption(): Promise<{
        method: 'KMS' | 'LOCAL';
        isValid: boolean;
        details: any;
    }>;
}
