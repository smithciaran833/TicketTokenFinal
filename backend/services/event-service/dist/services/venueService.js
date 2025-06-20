"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let VenueService = class VenueService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(data) {
        const existing = await this.prisma.venues.findFirst({
            where: {
                latitude: data.latitude,
                longitude: data.longitude,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Venue already exists at this location');
        }
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
    async findOne(id) {
        const venue = await this.prisma.venues.findUnique({
            where: { id },
            include: {
                events: true,
            },
        });
        if (!venue) {
            throw new common_1.NotFoundException('Venue not found');
        }
        return this.transformVenue(venue);
    }
    async update(id, data) {
        const venue = await this.findOne(id);
        const updateData = {
            updated_at: new Date(),
        };
        if (data.name)
            updateData.name = data.name;
        if (data.address)
            updateData.address = data.address;
        if (data.city)
            updateData.city = data.city;
        if (data.state)
            updateData.state = data.state;
        if (data.capacity)
            updateData.capacity = data.capacity;
        if (data.amenities)
            updateData.amenities = JSON.stringify(data.amenities);
        const updated = await this.prisma.venues.update({
            where: { id },
            data: updateData,
        });
        return this.transformVenue(updated);
    }
    transformVenue(venue) {
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
            events: venue.events ? venue.events.map((event) => ({
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
};
exports.VenueService = VenueService;
exports.VenueService = VenueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], VenueService);
//# sourceMappingURL=venueService.js.map