export declare class WalletService {
    private logger;
    private connection;
    private treasuryKeypair;
    constructor();
    createCustodialWallet(userId: string): Promise<{
        publicKey: string;
        encryptedPrivateKey: string;
    }>;
    getCustodialWalletBalance(publicKey: string): Promise<number>;
    createTemporaryWallet(): Promise<{
        publicKey: string;
        privateKey: string;
        expiresAt: Date;
    }>;
    prepareMigrationToPhantom(custodialWalletPublicKey: string, phantomWalletPublicKey: string): Promise<{
        migrationId: string;
        custodialWallet: string;
        phantomWallet: string;
        status: string;
    }>;
    validateSolanaAddress(address: string): boolean;
    checkWalletExists(publicKey: string): Promise<boolean>;
    private encryptPrivateKey;
    private decryptPrivateKey;
    getTreasuryWallet(): string;
}
