import { TicketTier } from './TicketTier';

export class Event {
  // Blockchain fields (must match smart contract)
  event_id: bigint;
  organizer: string; // Solana pubkey
  name: string;
  venue: string;
  start_time: number; // Unix timestamp
  end_time: number;
  total_tickets: number;
  tickets_sold: number;
  tickets_used: number;
  tickets_burned: number;
  general_price: bigint; // Lamports
  vip_price: bigint; // Lamports
  cancelled: boolean;
  transferable: boolean;
  transfer_freeze_time?: number;
  gate_staff: string[]; // Array of pubkeys
  freeze_authorities: string[]; // Array of pubkeys
  burn_authorities: string[]; // Array of pubkeys
  tiers: TicketTier[];
  
  // Additional backend fields
  id: string; // UUID for database
  blockchain_address?: string; // Event PDA
  metadata?: EventMetadata;
  created_at: Date;
  updated_at: Date;
  
  // Computed fields
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

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SELLING = 'SELLING',
  SOLD_OUT = 'SOLD_OUT',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}
