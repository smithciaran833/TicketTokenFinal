export declare class CreateEventDto {
    name: string;
    description?: string;
    venueId: string;
    organizerWallet: string;
    startTime: string;
    endTime: string;
    totalTickets: number;
    generalPrice: number;
    vipPrice: number;
    tiers?: any[];
}
export declare class UpdateEventDto {
    name?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    totalTickets?: number;
    generalPrice?: number;
    vipPrice?: number;
}
export declare class EventFilterDto {
    organizerWallet?: string;
    venueId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
}
