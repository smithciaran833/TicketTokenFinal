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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const eventService_1 = require("./eventService");
let ScheduleService = class ScheduleService {
    constructor(eventService) {
        this.eventService = eventService;
        this.prisma = new client_1.PrismaClient();
    }
    async createRecurringEvents(data) {
        const templateEvent = await this.prisma.events.findUnique({
            where: { id: data.templateEventId },
            include: { ticket_tiers: true },
        });
        if (!templateEvent) {
            throw new common_1.BadRequestException('Template event not found');
        }
        const createdEvents = [];
        const baseStartTime = new Date(templateEvent.start_time);
        const baseEndTime = new Date(templateEvent.end_time);
        for (let i = 1; i <= data.recurrenceCount; i++) {
            const startTime = this.calculateNextDate(baseStartTime, data.recurrenceType, i, data.dayOfWeek, data.dayOfMonth);
            const endTime = new Date(startTime);
            endTime.setHours(baseEndTime.getHours(), baseEndTime.getMinutes());
            const event = await this.prisma.events.create({
                data: {
                    id: `event-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    event_id: BigInt(Date.now() + i),
                    organizer_wallet: templateEvent.organizer_wallet,
                    name: `${templateEvent.name} - ${startTime.toLocaleDateString()}`,
                    description: templateEvent.description,
                    venue_id: templateEvent.venue_id,
                    start_time: startTime,
                    end_time: endTime,
                    total_tickets: templateEvent.total_tickets,
                    general_price: templateEvent.general_price,
                    vip_price: templateEvent.vip_price,
                    status: 'DRAFT',
                    updated_at: new Date(),
                },
            });
            for (const tier of templateEvent.ticket_tiers) {
                await this.prisma.ticket_tiers.create({
                    data: {
                        id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        event_id: event.id,
                        name: tier.name,
                        price: tier.price,
                        total_supply: tier.total_supply,
                        dynamic_pricing: tier.dynamic_pricing,
                        min_price: tier.min_price,
                        max_price: tier.max_price,
                        metadata: tier.metadata,
                    },
                });
            }
            createdEvents.push(event);
        }
        return createdEvents;
    }
    async getEventSchedule(venueId, startDate, endDate) {
        return this.prisma.events.findMany({
            where: {
                venue_id: venueId,
                start_time: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                start_time: 'asc',
            },
            include: {
                venues: true,
            },
        });
    }
    async findAvailableSlots(venueId, duration, startDate, endDate) {
        const events = await this.prisma.events.findMany({
            where: {
                venue_id: venueId,
                start_time: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                start_time: 'asc',
            },
        });
        const availableSlots = [];
        let currentTime = new Date(startDate);
        for (const event of events) {
            const eventStart = new Date(event.start_time);
            const slotEnd = new Date(currentTime);
            slotEnd.setHours(currentTime.getHours() + duration);
            if (slotEnd <= eventStart) {
                availableSlots.push({
                    start: new Date(currentTime),
                    end: slotEnd,
                });
            }
            currentTime = new Date(event.end_time);
        }
        const finalSlotEnd = new Date(currentTime);
        finalSlotEnd.setHours(currentTime.getHours() + duration);
        if (finalSlotEnd <= endDate) {
            availableSlots.push({
                start: new Date(currentTime),
                end: finalSlotEnd,
            });
        }
        return availableSlots;
    }
    async checkConflicts(venueId, startTime, endTime, excludeEventId) {
        const where = {
            venue_id: venueId,
            OR: [
                {
                    start_time: {
                        lte: startTime,
                    },
                    end_time: {
                        gt: startTime,
                    },
                },
                {
                    start_time: {
                        lt: endTime,
                    },
                    end_time: {
                        gte: endTime,
                    },
                },
                {
                    start_time: {
                        gte: startTime,
                    },
                    end_time: {
                        lte: endTime,
                    },
                },
            ],
        };
        if (excludeEventId) {
            where.id = { not: excludeEventId };
        }
        const conflicts = await this.prisma.events.count({ where });
        return conflicts > 0;
    }
    calculateNextDate(baseDate, recurrenceType, iteration, dayOfWeek, dayOfMonth) {
        const date = new Date(baseDate);
        switch (recurrenceType) {
            case 'DAILY':
                date.setDate(date.getDate() + iteration);
                break;
            case 'WEEKLY':
                date.setDate(date.getDate() + (iteration * 7));
                if (dayOfWeek !== undefined) {
                    const currentDay = date.getDay();
                    const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
                    date.setDate(date.getDate() + daysToAdd);
                }
                break;
            case 'MONTHLY':
                date.setMonth(date.getMonth() + iteration);
                if (dayOfMonth !== undefined) {
                    date.setDate(dayOfMonth);
                }
                break;
        }
        return date;
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventService_1.EventService])
], ScheduleService);
//# sourceMappingURL=scheduleService.js.map