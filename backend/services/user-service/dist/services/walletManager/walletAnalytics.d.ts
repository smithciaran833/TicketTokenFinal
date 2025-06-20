import { Queue } from 'bullmq';
export declare class WalletAnalyticsService {
    private analyticsQueue;
    private logger;
    constructor(analyticsQueue: Queue);
    trackWalletCreation(data: {
        userId: string;
        walletType: 'CUSTODIAL' | 'PHANTOM';
        walletAddress: string;
        source: string;
        metadata?: any;
    }): Promise<void>;
    trackMigration(data: {
        userId: string;
        fromWallet: string;
        toWallet: string;
        ticketCount: number;
        duration: number;
        success: boolean;
        failureReason?: string;
    }): Promise<void>;
    trackWalletUsage(data: {
        userId: string;
        walletAddress: string;
        action: 'PURCHASE' | 'TRANSFER' | 'RECEIVE' | 'LIST' | 'VIEW';
        metadata?: any;
    }): Promise<void>;
    getWalletMetrics(timeframe: 'day' | 'week' | 'month' | 'all'): Promise<{
        totalWallets: number;
        custodialWallets: number;
        phantomWallets: number;
        migrationsCompleted: number;
        migrationSuccessRate: number;
        avgMigrationTime: number;
        activeWallets: number;
        conversionRate: number;
    }>;
    getUserWalletJourney(userId: string): Promise<{
        userId: string;
        journey: Array<{
            timestamp: Date;
            event: string;
            walletType: string;
            details: any;
        }>;
        currentWalletType: 'CUSTODIAL' | 'PHANTOM' | 'NONE';
        totalTransactions: number;
        migrationAttempts: number;
    }>;
    getConversionFunnel(dateRange: {
        start: Date;
        end: Date;
    }): Promise<{
        stages: Array<{
            stage: string;
            count: number;
            percentage: number;
            avgTimeToNext: number;
        }>;
        overallConversion: number;
    }>;
    generateWalletReport(params: {
        startDate: Date;
        endDate: Date;
        groupBy: 'day' | 'week' | 'month';
    }): Promise<{
        summary: any;
        timeSeries: Array<{
            date: Date;
            custodialCreated: number;
            phantomCreated: number;
            migrationsCompleted: number;
            activeWallets: number;
        }>;
        insights: string[];
    }>;
    trackConversionEvent(data: {
        userId: string;
        event: 'VIEW_MIGRATION' | 'START_MIGRATION' | 'COMPLETE_MIGRATION' | 'ABANDON_MIGRATION';
        metadata?: any;
    }): Promise<void>;
}
