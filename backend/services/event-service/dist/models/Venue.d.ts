export declare class Venue {
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
    venue_type: VenueType;
    amenities: string[];
    parking_available: boolean;
    public_transport: string[];
    contact_email: string;
    contact_phone: string;
    website?: string;
    owner_wallet: string;
    verified: boolean;
    commission_rate: number;
    images: string[];
    description: string;
    created_at: Date;
    updated_at: Date;
}
export declare enum VenueType {
    CLUB = "CLUB",
    THEATER = "THEATER",
    ARENA = "ARENA",
    STADIUM = "STADIUM",
    OUTDOOR = "OUTDOOR",
    OTHER = "OTHER"
}
