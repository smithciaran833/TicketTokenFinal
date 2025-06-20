import { ScheduleService } from '../services/scheduleService';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    createRecurring(data: {
        templateEventId: string;
        recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        recurrenceCount: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
    }): Promise<any[]>;
    getVenueSchedule(venueId: string, startDate: string, endDate: string): Promise<({
        venues: {
            id: string;
            name: string;
            metadata: string | null;
            created_at: Date;
            updated_at: Date;
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
        };
    } & {
        id: string;
        event_id: bigint;
        blockchain_address: string | null;
        organizer_wallet: string;
        name: string;
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
        metadata: string | null;
        status: string;
        created_at: Date;
        updated_at: Date;
    })[]>;
    findAvailableSlots(venueId: string, duration: string, startDate: string, endDate: string): Promise<{
        start: Date;
        end: Date;
    }[]>;
    checkConflicts(data: {
        venueId: string;
        startTime: string;
        endTime: string;
        excludeEventId?: string;
    }): Promise<{
        hasConflicts: boolean;
    }>;
}
