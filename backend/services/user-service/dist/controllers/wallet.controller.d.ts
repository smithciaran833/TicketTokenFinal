import { CustodialWalletService } from '../services/walletManager/custodialWallet';
import { PhantomIntegrationService } from '../services/walletManager/phantomIntegration';
import { WalletMigrationService } from '../services/walletManager/walletMigration';
import { WalletAnalyticsService } from '../services/walletManager/walletAnalytics';
import { CreateWalletDto } from '../dto/wallet.dto';
export declare class WalletController {
    private readonly custodialService;
    private readonly phantomService;
    private readonly migrationService;
    private readonly analyticsService;
    constructor(custodialService: CustodialWalletService, phantomService: PhantomIntegrationService, migrationService: WalletMigrationService, analyticsService: WalletAnalyticsService);
    createWallet(createWalletDto: CreateWalletDto): Promise<{
        walletAddress: string;
        encrypted: boolean;
        walletType: string;
        message: string;
        connectionUrl?: undefined;
    } | {
        connectionUrl: string;
        walletType: string;
        message: string;
        walletAddress?: undefined;
        encrypted?: undefined;
    }>;
    connectPhantom(connectDto: any): Promise<{
        verified: boolean;
        walletAddress: any;
        message: string;
    }>;
    getBalance(walletAddress: string): Promise<{
        balance: number;
        walletAddress: string;
        formatted: string;
    }>;
    migrateWallet(migrateDto: any): Promise<{
        migrationId: string;
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
        message: string;
    }>;
    getMigrationStatus(migrationId: string): Promise<{
        migrationId: string;
        status: string;
        progress: number;
        error: string;
    }>;
    getAnalytics(userId: string): Promise<{
        totalWallets: number;
        totalTransactions: number;
        lastActivity: Date;
        walletTypes: string[];
        conversionMetrics: {
            custodialToPhantom: number;
            timeToConversion: any;
        };
    }>;
}
