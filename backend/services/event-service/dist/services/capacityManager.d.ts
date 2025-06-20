export declare class CapacityManager {
    private redis;
    constructor();
    reserveTickets(eventId: string, tierId: string, quantity: number): Promise<boolean>;
    releaseTickets(eventId: string, tierId: string, quantity: number): Promise<void>;
    getRealtimeCapacity(eventId: string): Promise<Map<string, number>>;
    initializeCapacity(eventId: string, tiers: Array<{
        id: string;
        totalSupply: number;
        mintedCount: number;
    }>): Promise<void>;
    handlePurchaseComplete(eventId: string, tierId: string, quantity: number): Promise<void>;
    handlePurchaseFailed(eventId: string, tierId: string, quantity: number): Promise<void>;
}
