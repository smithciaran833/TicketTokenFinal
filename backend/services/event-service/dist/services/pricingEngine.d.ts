export declare class PricingEngine {
    private prisma;
    constructor();
    calculateDynamicPrice(tierId: string): Promise<bigint>;
    getRecommendedPrice(eventId: string): Promise<{
        general: bigint;
        vip: bigint;
    }>;
    updateTierPrice(tierId: string, newPrice: bigint): Promise<void>;
}
