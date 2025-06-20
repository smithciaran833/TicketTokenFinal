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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const eventService_1 = require("../services/eventService");
const event_dto_1 = require("../dto/event.dto");
let EventController = class EventController {
    constructor(eventService) {
        this.eventService = eventService;
    }
    async create(createEventDto) {
        const event = await this.eventService.createEvent({
            ...createEventDto,
            startTime: new Date(createEventDto.startTime),
            endTime: new Date(createEventDto.endTime),
        });
        return this.serializeEvent(event);
    }
    async findAll(filters) {
        const events = await this.eventService.findAll({
            ...filters,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        });
        return events.map(event => this.serializeEvent(event));
    }
    async findOne(id) {
        const event = await this.eventService.findOne(id);
        return this.serializeEvent(event);
    }
    async update(id, updateEventDto) {
        const event = await this.eventService.update(id, {
            ...updateEventDto,
            startTime: updateEventDto.startTime ? new Date(updateEventDto.startTime) : undefined,
            endTime: updateEventDto.endTime ? new Date(updateEventDto.endTime) : undefined,
        });
        return this.serializeEvent(event);
    }
    async cancel(id, reason) {
        const event = await this.eventService.cancel(id, reason);
        return this.serializeEvent(event);
    }
    async getCapacity(id) {
        return this.eventService.getCapacity(id);
    }
    async syncFromBlockchain(id) {
        await this.eventService.syncFromBlockchain(id);
        return { message: 'Sync initiated' };
    }
    serializeEvent(event) {
        return {
            ...event,
            eventId: event.eventId?.toString(),
            generalPrice: event.generalPrice?.toString(),
            vipPrice: event.vipPrice?.toString(),
            tiers: event.tiers?.map((tier) => ({
                ...tier,
                price: tier.price?.toString(),
                minPrice: tier.minPrice?.toString(),
                maxPrice: tier.maxPrice?.toString(),
            })),
        };
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all events' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.EventFilterDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the event' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an event' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an event' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(':id/capacity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event capacity information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns capacity details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "getCapacity", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sync event from blockchain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event synced successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "syncFromBlockchain", null);
exports.EventController = EventController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [eventService_1.EventService])
], EventController);
//# sourceMappingURL=eventController.js.map