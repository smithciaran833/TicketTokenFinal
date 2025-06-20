import { Transaction } from '@solana/web3.js';
export declare class CustodialWalletService {
    private logger;
    private connection;
    constructor();
    createCustodialWallet(email: string, userId: string): Promise<{
        walletAddress: string;
        encryptedSeed: string;
        walletType: 'CUSTODIAL';
        createdAt: Date;
    }>;
    getWalletBalance(walletAddress: string): Promise<{
        balance: number;
        hasMinimumRent: boolean;
    }>;
    signTransaction(walletAddress: string, encryptedSeed: string, transaction: Transaction): Promise<Transaction>;
    transferTicketOwnership(fromWallet: string, fromEncryptedSeed: string, toWallet: string, ticketPDA: string, programId: string): Promise<string>;
    recoverWallet(email: string, userId: string, verificationCode: string): Promise<{
        success: boolean;
        walletAddress?: string;
    }>;
    private encryptSeed;
    private decryptSeed;
    private generateRecoveryCode;
    private fundWalletWithMinimumRent;
    getUserWallets(userId: string): Promise<Array<{
        walletAddress: string;
        type: string;
    }>>;
}
