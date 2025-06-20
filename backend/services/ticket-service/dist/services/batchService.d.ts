import { Queue } from 'bullmq';
export declare class BatchService {
    private batchQueue;
    private logger;
    constructor(batchQueue: Queue);
    processBulkPurchase(data: {
        eventId: string;
        purchases: Array<{
            email: string;
            walletAddress?: string;
            tier: string;
            quantity: number;
        }>;
        paymentId: string;
        organizerWallet: string;
    }): Promise<{
        batchId: string;
        totalTickets: number;
        estimatedTime: string;
    }>;
    processBulkTransfer(data: {
        fromWallet: string;
        transfers: Array<{
            ticketId: string;
            toWallet: string;
            toEmail?: string;
        }>;
    }): Promise<{
        batchId: string;
        totalTransfers: number;
        status: string;
    }>;
    processBulkValidation(data: {
        eventId: string;
        validations: Array<{
            ticketId: string;
            gateId: string;
            validatorId: string;
        }>;
    }): Promise<{
        batchId: string;
        results: Array<{
            ticketId: string;
            valid: boolean;
            reason?: string;
        }>;
    }>;
    getBatchStatus(batchId: string): Promise<{
        status: string;
        progress: number;
        completedItems: number;
        totalItems: number;
        errors?: any[];
    }>;
    cancelBatch(batchId: string): Promise<boolean>;
}
