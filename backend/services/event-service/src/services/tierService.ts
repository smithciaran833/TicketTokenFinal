import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TierService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createTier(data: {
    eventId: string;
    name: string;
    price: bigint;
    totalSupply: number;
    dynamicPricing?: boolean;
    minPrice?: bigint;
    maxPrice?: bigint;
    perks?: string[];
  }) {
    // Validate dynamic pricing settings
    if (data.dynamicPricing) {
      if (!data.minPrice || !data.maxPrice) {
        throw new BadRequestException(
          'Min and max prices required for dynamic pricing'
        );
      }
      if (data.price < data.minPrice || data.price > data.maxPrice) {
        throw new BadRequestException(
          'Initial price must be between min and max'
        );
      }
    }

    return this.prisma.ticket_tiers.create({
      data: {
        id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        event_id: data.eventId,
        name: data.name,
        price: data.price,
        total_supply: data.totalSupply,
        dynamic_pricing: data.dynamicPricing || false,
        min_price: data.minPrice,
        max_price: data.maxPrice,
        metadata: data.perks ? JSON.stringify({ perks: data.perks }) : null,
      },
    });
  }

  async updateTier(id: string, data: any) {
    const tier = await this.prisma.ticket_tiers.findUnique({
      where: { id },
    });

    if (!tier) {
      throw new NotFoundException('Tier not found');
    }

    // Don't allow reducing total supply below minted count
    if (data.totalSupply && data.totalSupply < tier.minted_count) {
      throw new BadRequestException(
        'Cannot reduce supply below already minted tickets'
      );
    }

    return this.prisma.ticket_tiers.update({
      where: { id },
      data,
    });
  }

  async deleteTier(id: string) {
    const tier = await this.prisma.ticket_tiers.findUnique({
      where: { id },
    });

    if (!tier) {
      throw new NotFoundException('Tier not found');
    }

    if (tier.minted_count > 0) {
      throw new BadRequestException(
        'Cannot delete tier with minted tickets'
      );
    }

    await this.prisma.ticket_tiers.delete({
      where: { id },
    });

    return { message: 'Tier deleted successfully' };
  }

  async getTiersByEvent(eventId: string) {
    return this.prisma.ticket_tiers.findMany({
      where: { event_id: eventId },
      orderBy: { price: 'asc' },
    });
  }

  async getTierAvailability(id: string) {
    const tier = await this.prisma.ticket_tiers.findUnique({
      where: { id },
    });

    if (!tier) {
      throw new NotFoundException('Tier not found');
    }

    return {
      total: tier.total_supply,
      minted: tier.minted_count,
      available: tier.total_supply - tier.minted_count,
      percentageSold: (tier.minted_count / tier.total_supply) * 100,
    };
  }
}
