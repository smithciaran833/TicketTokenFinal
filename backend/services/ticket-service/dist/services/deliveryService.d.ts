export declare class DeliveryService {
    private logger;
    private transporter;
    constructor();
    sendTicketEmail(data: {
        to: string;
        ticketId: string;
        eventName: string;
        eventDate: Date;
        venueName: string;
        venueAddress: string;
        tier: string;
        qrDataUrl: string;
        ticketPDA: string;
    }): Promise<boolean>;
    sendPurchaseConfirmation(data: {
        to: string;
        orderNumber: string;
        eventName: string;
        quantity: number;
        totalAmount: string;
        paymentMethod: string;
    }): Promise<boolean>;
    sendBatchTickets(recipients: Array<{
        email: string;
        tickets: Array<{
            ticketId: string;
            qrDataUrl: string;
            tier: string;
        }>;
    }>, eventDetails: {
        eventName: string;
        eventDate: Date;
        venueName: string;
        venueAddress: string;
    }): Promise<{
        sent: number;
        failed: number;
    }>;
    private generateTicketEmailHTML;
    private generatePurchaseConfirmationHTML;
}
