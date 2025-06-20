export declare class EventSchedule {
    id: string;
    event_template_id: string;
    recurrence_rule: string;
    start_date: Date;
    end_date?: Date;
    exceptions: Date[];
    event_duration: number;
    doors_open_offset: number;
    variations: ScheduleVariation[];
    active: boolean;
    generated_until: Date;
    created_at: Date;
    updated_at: Date;
}
export interface ScheduleVariation {
    date: Date;
    price_adjustment?: number;
    capacity_override?: number;
    special_guests?: string[];
    notes?: string;
}
