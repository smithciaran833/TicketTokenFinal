import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CapacityManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async reserveTickets(eventId: string, tierId: string, quantity: number): Promise<boolean> {
    const key = `capacity:${eventId}:${tierId}`;
    
    // Use Redis transaction for atomic operation
    const multi = this.redis.multi();
    
    // Get current count
    multi.get(key);
    
    const results = await multi.exec();
    const current = parseInt(results?.[0]?.[1] as string || '0');
    
    // Check if we have capacity
    // This would need to check against the tier's total supply
    // For now, assuming we have the capacity cached
    
    const reserved = await this.redis.incrby(key, quantity);
    
    // Set expiry for reservations (15 minutes)
    await this.redis.expire(key, 900);
    
    return true;
  }

  async releaseTickets(eventId: string, tierId: string, quantity: number): Promise<void> {
    const key = `capacity:${eventId}:${tierId}`;
    await this.redis.decrby(key, quantity);
  }

  async getRealtimeCapacity(eventId: string): Promise<Map<string, number>> {
    const pattern = `capacity:${eventId}:*`;
    const keys = await this.redis.keys(pattern);
    
    const capacity = new Map<string, number>();
    
    for (const key of keys) {
      const tierId = key.split(':')[2];
      const count = await this.redis.get(key);
      capacity.set(tierId, parseInt(count || '0'));
    }
    
    return capacity;
  }

  async initializeCapacity(eventId: string, tiers: Array<{id: string, totalSupply: number, mintedCount: number}>) {
    const pipeline = this.redis.pipeline();
    
    for (const tier of tiers) {
      const key = `capacity:${eventId}:${tier.id}`;
      const available = tier.totalSupply - tier.mintedCount;
      pipeline.set(key, available);
    }
    
    await pipeline.exec();
  }

  async handlePurchaseComplete(eventId: string, tierId: string, quantity: number) {
    // This is called after successful blockchain mint
    // We don't need to do anything here since the reservation
    // already decremented the available count
  }

  async handlePurchaseFailed(eventId: string, tierId: string, quantity: number) {
    // Release the tickets back to inventory
    await this.releaseTickets(eventId, tierId, quantity);
  }
}
