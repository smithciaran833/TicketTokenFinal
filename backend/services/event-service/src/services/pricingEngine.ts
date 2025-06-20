import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PricingEngine {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async calculateDynamicPrice(tierId: string): Promise<bigint> {
    const tier = await this.prisma.ticket_tiers.findUnique({
      where: { id: tierId },
    });

    if (!tier || !tier.dynamic_pricing) {
      return tier?.price || BigInt(0);
    }

    // Simple dynamic pricing based on supply/demand
    const soldPercentage = tier.minted_count / tier.total_supply;
    const priceMultiplier = 1 + (soldPercentage * 0.5); // Up to 50% increase

    const basePrice = Number(tier.price);
    const dynamicPrice = Math.round(basePrice * priceMultiplier);

    // Ensure within min/max bounds
    if (tier.min_price && dynamicPrice < Number(tier.min_price)) {
      return tier.min_price;
    }
    if (tier.max_price && dynamicPrice > Number(tier.max_price)) {
      return tier.max_price;
    }

    return BigInt(dynamicPrice);
  }

  async getRecommendedPrice(eventId: string): Promise<{
    general: bigint;
    vip: bigint;
  }> {
    const event = await this.prisma.events.findUnique({
      where: { id: eventId },
      include: { venues: true },
    });

    if (!event || !event.venues) {
      return { general: BigInt(5000), vip: BigInt(10000) }; // Default $50/$100
    }

    // Base pricing on venue capacity and type
    const capacity = event.venues.capacity;
    const venueType = event.venues.venue_type;

    let baseGeneral = 5000; // $50 default
    let baseVip = 10000; // $100 default

    // Adjust based on venue type
    switch (venueType) {
      case 'STADIUM':
        baseGeneral = 7500;
        baseVip = 15000;
        break;
      case 'ARENA':
        baseGeneral = 6000;
        baseVip = 12000;
        break;
      case 'THEATER':
        baseGeneral = 4000;
        baseVip = 8000;
        break;
      case 'CLUB':
        baseGeneral = 3000;
        baseVip = 6000;
        break;
    }

    // Adjust based on capacity (smaller venues = higher prices)
    if (capacity < 500) {
      baseGeneral = Math.round(baseGeneral * 1.2);
      baseVip = Math.round(baseVip * 1.2);
    } else if (capacity > 5000) {
      baseGeneral = Math.round(baseGeneral * 0.8);
      baseVip = Math.round(baseVip * 0.8);
    }

    return {
      general: BigInt(baseGeneral),
      vip: BigInt(baseVip),
    };
  }

  async updateTierPrice(tierId: string, newPrice: bigint): Promise<void> {
    const tier = await this.prisma.ticket_tiers.findUnique({
      where: { id: tierId },
    });

    if (!tier) {
      throw new Error('Tier not found');
    }

    // Validate against min/max if dynamic pricing is enabled
    if (tier.dynamic_pricing) {
      if (tier.min_price && newPrice < tier.min_price) {
        throw new Error('Price below minimum allowed');
      }
      if (tier.max_price && newPrice > tier.max_price) {
        throw new Error('Price above maximum allowed');
      }
    }

    await this.prisma.ticket_tiers.update({
      where: { id: tierId },
      data: { price: newPrice },
    });
  }
}
