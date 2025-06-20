import { MintingService } from '../services/mintingService';
import { QRService } from '../services/qrService';
import { BatchService } from '../services/batchService';
import { DeliveryService } from '../services/deliveryService';
export declare class TicketController {
    private readonly mintingService;
    private readonly qrService;
    private readonly batchService;
    private readonly deliveryService;
    constructor(mintingService: MintingService, qrService: QRService, batchService: BatchService, deliveryService: DeliveryService);
    mintTicket(mintDto: {
        eventId: string;
        walletAddress: string;
        tierIndex: number;
        quantity: number;
    }): Promise<{
        jobId: string;
        ticketId: string;
        status: string;
        message: string;
    }>;
    getMintStatus(jobId: string): Promise<{
        jobId: string;
        status: string;
        ticketId: string;
        message: string;
    }>;
    generateQR(ticketId: string): Promise<{
        ticketId: string;
        qrCode: string;
        format: string;
        expiresAt: Date;
    }>;
    validateTicket(validateDto: {
        qrData: string;
        eventId: string;
    }): Promise<{
        valid: boolean;
        message: string;
        timestamp: Date;
    }>;
    batchMint(batchDto: {
        eventId: string;
        purchases: Array<{
            walletAddress: string;
            tierIndex: number;
            quantity: number;
        }>;
    }): Promise<{
        batchId: string;
        totalTickets: number;
        status: string;
        message: string;
    }>;
    deliverTicket(deliveryDto: {
        ticketId: string;
        method: 'email' | 'sms';
        recipient: string;
    }): Promise<{
        delivered: boolean;
        method: "email" | "sms";
        recipient: string;
        message: string;
    }>;
}
