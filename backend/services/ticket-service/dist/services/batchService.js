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
var BatchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
let BatchService = BatchService_1 = class BatchService {
    constructor(batchQueue) {
        this.batchQueue = batchQueue;
        this.logger = new common_1.Logger(BatchService_1.name);
    }
    async processBulkPurchase(data) {
        const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const totalTickets = data.purchases.reduce((sum, p) => sum + p.quantity, 0);
        const job = await this.batchQueue.add('bulk-purchase', {
            batchId,
            ...data,
            timestamp: Date.now(),
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });
        this.logger.log(`Queued bulk purchase batch ${batchId} with ${totalTickets} tickets`);
        return {
            batchId,
            totalTickets,
            estimatedTime: `${Math.ceil(totalTickets / 10) * 30} seconds`,
        };
    }
    async processBulkTransfer(data) {
        const batchId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const job = await this.batchQueue.add('bulk-transfer', {
            batchId,
            ...data,
            timestamp: Date.now(),
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
        });
        this.logger.log(`Queued bulk transfer batch ${batchId} with ${data.transfers.length} transfers`);
        return {
            batchId,
            totalTransfers: data.transfers.length,
            status: 'queued',
        };
    }
    async processBulkValidation(data) {
        const batchId = `validation-${Date.now()}`;
        const results = [];
        for (const validation of data.validations) {
            results.push({
                ticketId: validation.ticketId,
                valid: true,
                reason: undefined,
            });
        }
        this.logger.log(`Processed bulk validation batch ${batchId}`);
        return {
            batchId,
            results,
        };
    }
    async getBatchStatus(batchId) {
        const queues = ['batch-operations', 'minting'];
        for (const queueName of queues) {
            const jobs = await this.batchQueue.getJobs(['active', 'waiting', 'completed', 'failed']);
            const job = jobs.find(j => j.data.batchId === batchId);
            if (job) {
                const state = await job.getState();
                const progress = job.progress || 0;
                return {
                    status: state,
                    progress,
                    completedItems: Math.floor((progress / 100) * (job.data.totalTickets || 1)),
                    totalItems: job.data.totalTickets || 1,
                    errors: job.failedReason ? [job.failedReason] : undefined,
                };
            }
        }
        return {
            status: 'not_found',
            progress: 0,
            completedItems: 0,
            totalItems: 0,
        };
    }
    async cancelBatch(batchId) {
        try {
            const jobs = await this.batchQueue.getJobs(['waiting', 'active']);
            const job = jobs.find(j => j.data.batchId === batchId);
            if (job) {
                await job.remove();
                this.logger.log(`Cancelled batch ${batchId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Failed to cancel batch: ${error.message}`);
            return false;
        }
    }
};
exports.BatchService = BatchService;
exports.BatchService = BatchService = BatchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_2.InjectQueue)('batch-operations')),
    __metadata("design:paramtypes", [bullmq_1.Queue])
], BatchService);
//# sourceMappingURL=batchService.js.map