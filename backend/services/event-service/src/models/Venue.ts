export class Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  
  // Venue details
  capacity: number;
  venue_type: VenueType;
  amenities: string[];
  parking_available: boolean;
  public_transport: string[];
  
  // Contact
  contact_email: string;
  contact_phone: string;
  website?: string;
  
  // Integration
  owner_wallet: string; // Solana wallet
  verified: boolean;
  commission_rate: number; // Platform fee for this venue
  
  // Metadata
  images: string[];
  description: string;
  created_at: Date;
  updated_at: Date;
}

export enum VenueType {
  CLUB = 'CLUB',
  THEATER = 'THEATER',
  ARENA = 'ARENA',
  STADIUM = 'STADIUM',
  OUTDOOR = 'OUTDOOR',
  OTHER = 'OTHER'
}
