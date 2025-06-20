import { TicketTier } from './TicketTier';
export declare class Event {
    event_id: bigint;
    organizer: string;
    name: string;
    venue: string;
    start_time: number;
    end_time: number;
    total_tickets: number;
    tickets_sold: number;
    tickets_used: number;
    tickets_burned: number;
    general_price: bigint;
    vip_price: bigint;
    cancelled: boolean;
    transferable: boolean;
    transfer_freeze_time?: number;
    gate_staff: string[];
    freeze_authorities: string[];
    burn_authorities: string[];
    tiers: TicketTier[];
    id: string;
    blockchain_address?: string;
    metadata?: EventMetadata;
    created_at: Date;
    updated_at: Date;
    capacity_remaining: number;
    revenue_total: bigint;
    status: EventStatus;
}
export interface EventMetadata {
    description?: string;
    image_url?: string;
    banner_url?: string;
    category?: string;
    tags?: string[];
    age_restriction?: number;
    venue_details?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
    };
}
export declare enum EventStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    SELLING = "SELLING",
    SOLD_OUT = "SOLD_OUT",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
