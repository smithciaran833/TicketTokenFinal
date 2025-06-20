import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EventService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'], // Enable logging
    });
  }

  async createEvent(data: {
    name: string;
    description?: string;
    venueId: string;
    organizerWallet: string;
    startTime: Date;
    endTime: Date;
    totalTickets: number;
    generalPrice: number;
    vipPrice: number;
    tiers?: any[];
  }) {
    try {
      console.log('Creating event with data:', data);
      
      // Validate dates
      if (data.startTime <= new Date()) {
        throw new BadRequestException('Event must start in the future');
      }
      if (data.endTime <= data.startTime) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check if venue exists
      const venue = await this.prisma.venues.findUnique({
        where: { id: data.venueId },
      });
      
      if (!venue) {
        throw new BadRequestException(`Venue with id ${data.venueId} not found`);
      }
      
      console.log('Found venue:', venue.name);

      // Convert prices to BigInt (store in cents)
      const generalPrice = BigInt(Math.round(data.generalPrice * 100));
      const vipPrice = BigInt(Math.round(data.vipPrice * 100));

      console.log('Creating event in database...');
      
      // Create event in database with snake_case fields
      const event = await this.prisma.events.create({
        data: {
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          event_id: BigInt(Date.now()),
          organizer_wallet: data.organizerWallet,
          name: data.name,
          description: data.description || '',
          venue_id: data.venueId,
          start_time: data.startTime,
          end_time: data.endTime,
          total_tickets: data.totalTickets,
          tickets_sold: 0,
          general_price: generalPrice,
          vip_price: vipPrice,
          status: 'DRAFT',
          updated_at: new Date(),
        },
        include: {
          venues: true,
        },
      });

      console.log('Event created successfully:', event.id);
      return this.transformEvent(event);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async findAll(filters?: {
    organizerWallet?: string;
    venueId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.organizerWallet) {
      where.organizer_wallet = filters.organizerWallet;
    }
    if (filters?.venueId) {
      where.venue_id = filters.venueId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
      where.start_time = {};
      if (filters?.startDate) {
        where.start_time.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.start_time.lte = filters.endDate;
      }
    }

    const events = await this.prisma.events.findMany({
      where,
      include: {
        venues: true,
      },
      orderBy: {
        start_time: 'asc',
      },
    });

    return events.map(event => this.transformEvent(event));
  }

  async findOne(id: string) {
    const event = await this.prisma.events.findUnique({
      where: { id },
      include: {
        venues: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.transformEvent(event);
  }

  async update(id: string, data: any) {
    const event = await this.findOne(id);

    const updateData: any = {
      updated_at: new Date(),
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startTime !== undefined) updateData.start_time = data.startTime;
    if (data.endTime !== undefined) updateData.end_time = data.endTime;
    if (data.totalTickets !== undefined) updateData.total_tickets = data.totalTickets;
    if (data.generalPrice !== undefined) updateData.general_price = BigInt(Math.round(data.generalPrice * 100));
    if (data.vipPrice !== undefined) updateData.vip_price = BigInt(Math.round(data.vipPrice * 100));

    const updated = await this.prisma.events.update({
      where: { id },
      data: updateData,
      include: {
        venues: true,
      },
    });

    return this.transformEvent(updated);
  }

  async cancel(id: string, reason: string) {
    const event = await this.findOne(id);

    if (event.cancelled) {
      throw new BadRequestException('Event is already cancelled');
    }

    const updated = await this.prisma.events.update({
      where: { id },
      data: {
        cancelled: true,
        status: 'CANCELLED',
        metadata: JSON.stringify({ cancellationReason: reason }),
        updated_at: new Date(),
      },
      include: {
        venues: true,
      },
    });

    return this.transformEvent(updated);
  }

  async getCapacity(id: string) {
    const event = await this.prisma.events.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    return {
      total: event.total_tickets,
      sold: event.tickets_sold,
      available: event.total_tickets - event.tickets_sold,
      percentageSold: (event.tickets_sold / event.total_tickets) * 100,
    };
  }

  async syncFromBlockchain(id: string) {
    // TODO: Implement blockchain sync
    console.log(`Syncing event ${id} from blockchain...`);
    return this.findOne(id);
  }

  async findUpcoming() {
    const events = await this.prisma.events.findMany({
      where: {
        start_time: {
          gte: new Date(),
        },
        status: 'ACTIVE',
      },
      include: {
        venues: true,
      },
      orderBy: {
        start_time: 'asc',
      },
      take: 10,
    });

    return events.map(event => this.transformEvent(event));
  }

  // Transform snake_case to camelCase for API responses
  private transformEvent(event: any) {
    if (!event) return null;
    
    return {
      id: event.id,
      eventId: event.event_id?.toString(),
      blockchainAddress: event.blockchain_address,
      organizerWallet: event.organizer_wallet,
      name: event.name,
      description: event.description,
      venueId: event.venue_id,
      venue: event.venues,
      startTime: event.start_time,
      endTime: event.end_time,
      totalTickets: event.total_tickets,
      ticketsSold: event.tickets_sold,
      ticketsUsed: event.tickets_used,
      ticketsBurned: event.tickets_burned,
      generalPrice: event.general_price?.toString(),
      vipPrice: event.vip_price?.toString(),
      cancelled: event.cancelled,
      transferable: event.transferable,
      transferFreezeTime: event.transfer_freeze_time,
      metadata: event.metadata,
      status: event.status,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    };
  }
}
