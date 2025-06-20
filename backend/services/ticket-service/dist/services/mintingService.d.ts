import { Queue } from 'bullmq';
export declare class MintingService {
    private mintingQueue;
    private logger;
    private connection;
    private program;
    constructor(mintingQueue: Queue);
    mintTicket(data: {
        eventId: string;
        eventPDA: string;
        buyerWallet: string;
        tier: string;
        price: bigint;
        paymentId: string;
    }): Promise<{
        jobId: string;
        status: string;
        estimatedTime: string;
    }>;
    batchMintTickets(data: {
        eventId: string;
        eventPDA: string;
        buyerWallet: string;
        tier: string;
        quantity: number;
        totalPrice: bigint;
        paymentId: string;
    }): Promise<{
        jobIds: any[];
        status: string;
        batches: number;
        totalQuantity: number;
    }>;
    processMintJob(job: any): Promise<{
        success: boolean;
        ticketIds: any[];
        eventId: any;
        buyerWallet: any;
    }>;
    getMintingStatus(jobId: string): Promise<{
        jobId: string;
        state: any;
        progress: any;
        data: any;
        result: any;
        failedReason: any;
    }>;
    private generateMockPDA;
    private generateMockTxId;
}
