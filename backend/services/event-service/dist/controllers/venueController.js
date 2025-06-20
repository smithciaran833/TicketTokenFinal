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
exports.VenueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const venueService_1 = require("../services/venueService");
const venue_dto_1 = require("../dto/venue.dto");
let VenueController = class VenueController {
    constructor(venueService) {
        this.venueService = venueService;
    }
    async create(createVenueDto) {
        return this.venueService.create(createVenueDto);
    }
    async findAll() {
        return this.venueService.findAll();
    }
    async findOne(id) {
        return this.venueService.findOne(id);
    }
    async update(id, updateVenueDto) {
        return this.venueService.update(id, updateVenueDto);
    }
};
exports.VenueController = VenueController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new venue' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Venue created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Venue already exists at location' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [venue_dto_1.CreateVenueDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all venues' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all venues' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venue by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the venue' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a venue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, venue_dto_1.UpdateVenueDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "update", null);
exports.VenueController = VenueController = __decorate([
    (0, swagger_1.ApiTags)('Venues'),
    (0, common_1.Controller)('venues'),
    __metadata("design:paramtypes", [venueService_1.VenueService])
], VenueController);
//# sourceMappingURL=venueController.js.map