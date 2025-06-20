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
exports.TierService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let TierService = class TierService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createTier(data) {
        if (data.dynamicPricing) {
            if (!data.minPrice || !data.maxPrice) {
                throw new common_1.BadRequestException('Min and max prices required for dynamic pricing');
            }
            if (data.price < data.minPrice || data.price > data.maxPrice) {
                throw new common_1.BadRequestException('Initial price must be between min and max');
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
    async updateTier(id, data) {
        const tier = await this.prisma.ticket_tiers.findUnique({
            where: { id },
        });
        if (!tier) {
            throw new common_1.NotFoundException('Tier not found');
        }
        if (data.totalSupply && data.totalSupply < tier.minted_count) {
            throw new common_1.BadRequestException('Cannot reduce supply below already minted tickets');
        }
        return this.prisma.ticket_tiers.update({
            where: { id },
            data,
        });
    }
    async deleteTier(id) {
        const tier = await this.prisma.ticket_tiers.findUnique({
            where: { id },
        });
        if (!tier) {
            throw new common_1.NotFoundException('Tier not found');
        }
        if (tier.minted_count > 0) {
            throw new common_1.BadRequestException('Cannot delete tier with minted tickets');
        }
        await this.prisma.ticket_tiers.delete({
            where: { id },
        });
        return { message: 'Tier deleted successfully' };
    }
    async getTiersByEvent(eventId) {
        return this.prisma.ticket_tiers.findMany({
            where: { event_id: eventId },
            orderBy: { price: 'asc' },
        });
    }
    async getTierAvailability(id) {
        const tier = await this.prisma.ticket_tiers.findUnique({
            where: { id },
        });
        if (!tier) {
            throw new common_1.NotFoundException('Tier not found');
        }
        return {
            total: tier.total_supply,
            minted: tier.minted_count,
            available: tier.total_supply - tier.minted_count,
            percentageSold: (tier.minted_count / tier.total_supply) * 100,
        };
    }
};
exports.TierService = TierService;
exports.TierService = TierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TierService);
//# sourceMappingURL=tierService.js.map