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
exports.PricingEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PricingEngine = class PricingEngine {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async calculateDynamicPrice(tierId) {
        const tier = await this.prisma.ticket_tiers.findUnique({
            where: { id: tierId },
        });
        if (!tier || !tier.dynamic_pricing) {
            return tier?.price || BigInt(0);
        }
        const soldPercentage = tier.minted_count / tier.total_supply;
        const priceMultiplier = 1 + (soldPercentage * 0.5);
        const basePrice = Number(tier.price);
        const dynamicPrice = Math.round(basePrice * priceMultiplier);
        if (tier.min_price && dynamicPrice < Number(tier.min_price)) {
            return tier.min_price;
        }
        if (tier.max_price && dynamicPrice > Number(tier.max_price)) {
            return tier.max_price;
        }
        return BigInt(dynamicPrice);
    }
    async getRecommendedPrice(eventId) {
        const event = await this.prisma.events.findUnique({
            where: { id: eventId },
            include: { venues: true },
        });
        if (!event || !event.venues) {
            return { general: BigInt(5000), vip: BigInt(10000) };
        }
        const capacity = event.venues.capacity;
        const venueType = event.venues.venue_type;
        let baseGeneral = 5000;
        let baseVip = 10000;
        switch (venueType) {
            case 'STADIUM':
                baseGeneral = 7500;
                baseVip = 15000;
                break;
            case 'ARENA':
                baseGeneral = 6000;
                baseVip = 12000;
                break;
            case 'THEATER':
                baseGeneral = 4000;
                baseVip = 8000;
                break;
            case 'CLUB':
                baseGeneral = 3000;
                baseVip = 6000;
                break;
        }
        if (capacity < 500) {
            baseGeneral = Math.round(baseGeneral * 1.2);
            baseVip = Math.round(baseVip * 1.2);
        }
        else if (capacity > 5000) {
            baseGeneral = Math.round(baseGeneral * 0.8);
            baseVip = Math.round(baseVip * 0.8);
        }
        return {
            general: BigInt(baseGeneral),
            vip: BigInt(baseVip),
        };
    }
    async updateTierPrice(tierId, newPrice) {
        const tier = await this.prisma.ticket_tiers.findUnique({
            where: { id: tierId },
        });
        if (!tier) {
            throw new Error('Tier not found');
        }
        if (tier.dynamic_pricing) {
            if (tier.min_price && newPrice < tier.min_price) {
                throw new Error('Price below minimum allowed');
            }
            if (tier.max_price && newPrice > tier.max_price) {
                throw new Error('Price above maximum allowed');
            }
        }
        await this.prisma.ticket_tiers.update({
            where: { id: tierId },
            data: { price: newPrice },
        });
    }
};
exports.PricingEngine = PricingEngine;
exports.PricingEngine = PricingEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PricingEngine);
//# sourceMappingURL=pricingEngine.js.map