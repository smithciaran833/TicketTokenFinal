export declare class CreateVenueDto {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    capacity: number;
    venueType: string;
    amenities?: string[];
    ownerWallet: string;
}
export declare class UpdateVenueDto {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    capacity?: number;
    amenities?: string[];
    isActive?: boolean;
}
