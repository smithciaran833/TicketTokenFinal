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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let EventService = class EventService {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            log: ['query', 'error', 'warn'],
        });
    }
    async createEvent(data) {
        try {
            console.log('Creating event with data:', data);
            if (data.startTime <= new Date()) {
                throw new common_1.BadRequestException('Event must start in the future');
            }
            if (data.endTime <= data.startTime) {
                throw new common_1.BadRequestException('End time must be after start time');
            }
            const venue = await this.prisma.venues.findUnique({
                where: { id: data.venueId },
            });
            if (!venue) {
                throw new common_1.BadRequestException(`Venue with id ${data.venueId} not found`);
            }
            console.log('Found venue:', venue.name);
            const generalPrice = BigInt(Math.round(data.generalPrice * 100));
            const vipPrice = BigInt(Math.round(data.vipPrice * 100));
            console.log('Creating event in database...');
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
        }
        catch (error) {
            console.error('Error creating event:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to create event: ${error.message}`);
        }
    }
    async findAll(filters) {
        const where = {};
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
    async findOne(id) {
        const event = await this.prisma.events.findUnique({
            where: { id },
            include: {
                venues: true,
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return this.transformEvent(event);
    }
    async update(id, data) {
        const event = await this.findOne(id);
        const updateData = {
            updated_at: new Date(),
        };
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.startTime !== undefined)
            updateData.start_time = data.startTime;
        if (data.endTime !== undefined)
            updateData.end_time = data.endTime;
        if (data.totalTickets !== undefined)
            updateData.total_tickets = data.totalTickets;
        if (data.generalPrice !== undefined)
            updateData.general_price = BigInt(Math.round(data.generalPrice * 100));
        if (data.vipPrice !== undefined)
            updateData.vip_price = BigInt(Math.round(data.vipPrice * 100));
        const updated = await this.prisma.events.update({
            where: { id },
            data: updateData,
            include: {
                venues: true,
            },
        });
        return this.transformEvent(updated);
    }
    async cancel(id, reason) {
        const event = await this.findOne(id);
        if (event.cancelled) {
            throw new common_1.BadRequestException('Event is already cancelled');
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
    async getCapacity(id) {
        const event = await this.prisma.events.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return {
            total: event.total_tickets,
            sold: event.tickets_sold,
            available: event.total_tickets - event.tickets_sold,
            percentageSold: (event.tickets_sold / event.total_tickets) * 100,
        };
    }
    async syncFromBlockchain(id) {
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
    transformEvent(event) {
        if (!event)
            return null;
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
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EventService);
//# sourceMappingURL=eventService.js.map