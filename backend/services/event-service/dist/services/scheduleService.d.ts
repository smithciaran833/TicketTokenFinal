import { EventService } from './eventService';
export declare class ScheduleService {
    private eventService;
    private prisma;
    constructor(eventService: EventService);
    createRecurringEvents(data: {
        templateEventId: string;
        recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        recurrenceCount: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
    }): Promise<any[]>;
    getEventSchedule(venueId: string, startDate: Date, endDate: Date): Promise<({
        venues: {
            id: string;
            name: string;
            address: string;
            city: string;
            state: string;
            country: string;
            postal_code: string;
            latitude: number;
            longitude: number;
            capacity: number;
            venue_type: string;
            amenities: string;
            owner_wallet: string;
            verified: boolean;
            metadata: string | null;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: string;
        name: string;
        metadata: string | null;
        created_at: Date;
        updated_at: Date;
        event_id: bigint;
        blockchain_address: string | null;
        organizer_wallet: string;
        description: string | null;
        venue_id: string;
        start_time: Date;
        end_time: Date;
        total_tickets: number;
        tickets_sold: number;
        tickets_used: number;
        tickets_burned: number;
        general_price: bigint;
        vip_price: bigint;
        cancelled: boolean;
        transferable: boolean;
        transfer_freeze_time: Date | null;
        status: string;
    })[]>;
    findAvailableSlots(venueId: string, duration: number, startDate: Date, endDate: Date): Promise<Array<{
        start: Date;
        end: Date;
    }>>;
    checkConflicts(venueId: string, startTime: Date, endTime: Date, excludeEventId?: string): Promise<boolean>;
    private calculateNextDate;
}
