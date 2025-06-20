export declare class QRService {
    private logger;
    generateTicketQR(data: {
        ticketId: string;
        eventId: string;
        ticketPDA: string;
        owner: string;
        tier: string;
        eventDate: Date;
    }): Promise<{
        qrDataUrl: string;
        qrBuffer: Buffer;
        verificationCode: string;
    }>;
    generateEventQR(eventId: string, eventPDA: string): Promise<string>;
    validateQRData(qrData: string): {
        isValid: boolean;
        data?: any;
        error?: string;
    };
    verifyOfflineCode(ticketPDA: string, owner: string, eventDate: Date, providedCode: string): boolean;
    private generateVerificationCode;
    generateBulkQRCodes(tickets: Array<{
        ticketId: string;
        eventId: string;
        ticketPDA: string;
        owner: string;
        tier: string;
        eventDate: Date;
    }>): Promise<Map<string, {
        qrDataUrl: string;
        verificationCode: string;
    }>>;
}
