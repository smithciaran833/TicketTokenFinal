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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scheduleService_1 = require("../services/scheduleService");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async createRecurring(data) {
        return this.scheduleService.createRecurringEvents(data);
    }
    async getVenueSchedule(venueId, startDate, endDate) {
        return this.scheduleService.getEventSchedule(venueId, new Date(startDate), new Date(endDate));
    }
    async findAvailableSlots(venueId, duration, startDate, endDate) {
        return this.scheduleService.findAvailableSlots(venueId, parseInt(duration), new Date(startDate), new Date(endDate));
    }
    async checkConflicts(data) {
        const hasConflicts = await this.scheduleService.checkConflicts(data.venueId, new Date(data.startTime), new Date(data.endTime), data.excludeEventId);
        return { hasConflicts };
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.Post)('recurring'),
    (0, swagger_1.ApiOperation)({ summary: 'Create recurring events from template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Recurring events created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "createRecurring", null);
__decorate([
    (0, common_1.Get)('venue/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venue event schedule' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true }),
    __param(0, (0, common_1.Param)('venueId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getVenueSchedule", null);
__decorate([
    (0, common_1.Get)('venue/:venueId/slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Find available time slots' }),
    (0, swagger_1.ApiQuery)({ name: 'duration', required: true, description: 'Duration in hours' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true }),
    __param(0, (0, common_1.Param)('venueId')),
    __param(1, (0, common_1.Query)('duration')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findAvailableSlots", null);
__decorate([
    (0, common_1.Post)('check-conflicts'),
    (0, swagger_1.ApiOperation)({ summary: 'Check for scheduling conflicts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "checkConflicts", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, swagger_1.ApiTags)('Schedule'),
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [scheduleService_1.ScheduleService])
], ScheduleController);
//# sourceMappingURL=scheduleController.js.map