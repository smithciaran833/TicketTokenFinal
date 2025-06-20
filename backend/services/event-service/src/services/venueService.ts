import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class VenueService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: any) {
    // Check if venue already exists at this location
    const existing = await this.prisma.venues.findFirst({
      where: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    if (existing) {
      throw new ConflictException('Venue already exists at this location');
    }

    // Convert amenities array to JSON string
    const amenitiesString = JSON.stringify(data.amenities || []);

    const venue = await this.prisma.venues.create({
      data: {
        id: `venue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        capacity: data.capacity,
        venue_type: data.venueType,
        amenities: amenitiesString,
        owner_wallet: data.ownerWallet,
        updated_at: new Date(),
      },
    });

    return this.transformVenue(venue);
  }

  async findAll() {
    const venues = await this.prisma.venues.findMany({
      include: {
        events: {
          where: {
            start_time: {
              gte: new Date(),
            },
          },
        },
      },
    });

    return venues.map(venue => this.transformVenue(venue));
  }

  async findOne(id: string) {
    const venue = await this.prisma.venues.findUnique({
      where: { id },
      include: {
        events: true,
      },
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    return this.transformVenue(venue);
  }

  async update(id: string, data: any) {
    const venue = await this.findOne(id);

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.capacity) updateData.capacity = data.capacity;
    if (data.amenities) updateData.amenities = JSON.stringify(data.amenities);

    const updated = await this.prisma.venues.update({
      where: { id },
      data: updateData,
    });

    return this.transformVenue(updated);
  }

  // Transform snake_case to camelCase for API responses and handle BigInt
  private transformVenue(venue: any) {
    return {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      country: venue.country,
      postalCode: venue.postal_code,
      latitude: venue.latitude,
      longitude: venue.longitude,
      capacity: venue.capacity,
      venueType: venue.venue_type,
      amenities: venue.amenities ? JSON.parse(venue.amenities) : [],
      ownerWallet: venue.owner_wallet,
      verified: venue.verified,
      metadata: venue.metadata,
      createdAt: venue.created_at,
      updatedAt: venue.updated_at,
      // Transform events if included, handling BigInt
      events: venue.events ? venue.events.map((event: any) => ({
        ...event,
        event_id: event.event_id?.toString(),
        general_price: event.general_price?.toString(),
        vip_price: event.vip_price?.toString(),
        tickets_sold: event.tickets_sold || 0,
        tickets_used: event.tickets_used || 0,
        tickets_burned: event.tickets_burned || 0,
      })) : undefined,
    };
  }
}
