import { Queue } from 'bullmq';
export declare class WalletMigrationService {
    private migrationQueue;
    private logger;
    private connection;
    constructor(migrationQueue: Queue);
    initiateMigration(data: {
        userId: string;
        email: string;
        custodialWallet: string;
        phantomWallet: string;
    }): Promise<{
        migrationId: string;
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
        estimatedTime: string;
    }>;
    getMigrationStatus(migrationId: string): Promise<{
        migrationId: string;
        status: string;
        progress: number;
        ticketsMigrated: number;
        totalTickets: number;
        errors?: string[];
    }>;
    processMigration(job: any): Promise<{
        success: boolean;
        ticketsMigrated: number;
        failedTransfers: string[];
    }>;
    rollbackMigration(migrationId: string): Promise<boolean>;
    private generateMigrationId;
    private getWalletTickets;
    private transferTicket;
    private updateUserWalletPreference;
    private findMigrationJob;
}
