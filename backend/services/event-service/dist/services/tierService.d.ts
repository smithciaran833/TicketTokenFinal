export declare class TierService {
    private prisma;
    constructor();
    createTier(data: {
        eventId: string;
        name: string;
        price: bigint;
        totalSupply: number;
        dynamicPricing?: boolean;
        minPrice?: bigint;
        maxPrice?: bigint;
        perks?: string[];
    }): Promise<{
        id: string;
        name: string;
        metadata: string | null;
        event_id: string;
        price: bigint;
        total_supply: number;
        minted_count: number;
        dynamic_pricing: boolean;
        min_price: bigint | null;
        max_price: bigint | null;
    }>;
    updateTier(id: string, data: any): Promise<{
        id: string;
        name: string;
        metadata: string | null;
        event_id: string;
        price: bigint;
        total_supply: number;
        minted_count: number;
        dynamic_pricing: boolean;
        min_price: bigint | null;
        max_price: bigint | null;
    }>;
    deleteTier(id: string): Promise<{
        message: string;
    }>;
    getTiersByEvent(eventId: string): Promise<{
        id: string;
        name: string;
        metadata: string | null;
        event_id: string;
        price: bigint;
        total_supply: number;
        minted_count: number;
        dynamic_pricing: boolean;
        min_price: bigint | null;
        max_price: bigint | null;
    }[]>;
    getTierAvailability(id: string): Promise<{
        total: number;
        minted: number;
        available: number;
        percentageSold: number;
    }>;
}
