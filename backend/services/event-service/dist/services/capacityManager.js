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
exports.CapacityManager = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CapacityManager = class CapacityManager {
    constructor() {
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    async reserveTickets(eventId, tierId, quantity) {
        const key = `capacity:${eventId}:${tierId}`;
        const multi = this.redis.multi();
        multi.get(key);
        const results = await multi.exec();
        const current = parseInt(results?.[0]?.[1] || '0');
        const reserved = await this.redis.incrby(key, quantity);
        await this.redis.expire(key, 900);
        return true;
    }
    async releaseTickets(eventId, tierId, quantity) {
        const key = `capacity:${eventId}:${tierId}`;
        await this.redis.decrby(key, quantity);
    }
    async getRealtimeCapacity(eventId) {
        const pattern = `capacity:${eventId}:*`;
        const keys = await this.redis.keys(pattern);
        const capacity = new Map();
        for (const key of keys) {
            const tierId = key.split(':')[2];
            const count = await this.redis.get(key);
            capacity.set(tierId, parseInt(count || '0'));
        }
        return capacity;
    }
    async initializeCapacity(eventId, tiers) {
        const pipeline = this.redis.pipeline();
        for (const tier of tiers) {
            const key = `capacity:${eventId}:${tier.id}`;
            const available = tier.totalSupply - tier.mintedCount;
            pipeline.set(key, available);
        }
        await pipeline.exec();
    }
    async handlePurchaseComplete(eventId, tierId, quantity) {
    }
    async handlePurchaseFailed(eventId, tierId, quantity) {
        await this.releaseTickets(eventId, tierId, quantity);
    }
};
exports.CapacityManager = CapacityManager;
exports.CapacityManager = CapacityManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CapacityManager);
//# sourceMappingURL=capacityManager.js.map