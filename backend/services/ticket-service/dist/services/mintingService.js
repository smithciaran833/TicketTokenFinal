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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MintingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintingService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const bs58_1 = __importDefault(require("bs58"));
let MintingService = MintingService_1 = class MintingService {
    constructor(mintingQueue) {
        this.mintingQueue = mintingQueue;
        this.logger = new common_1.Logger(MintingService_1.name);
        this.connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    }
    async mintTicket(data) {
        try {
            this.logger.log(`Minting ticket for event ${data.eventId}, buyer ${data.buyerWallet}`);
            const job = await this.mintingQueue.add('mint-single', {
                ...data,
                timestamp: Date.now(),
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            });
            return {
                jobId: job.id,
                status: 'queued',
                estimatedTime: '10-30 seconds',
            };
        }
        catch (error) {
            this.logger.error(`Failed to queue minting: ${error.message}`);
            throw error;
        }
    }
    async batchMintTickets(data) {
        this.logger.log(`Batch minting ${data.quantity} tickets for event ${data.eventId}`);
        const batchSize = 10;
        const batches = Math.ceil(data.quantity / batchSize);
        const jobs = [];
        for (let i = 0; i < batches; i++) {
            const start = i * batchSize;
            const end = Math.min((i + 1) * batchSize, data.quantity);
            const quantity = end - start;
            const job = await this.mintingQueue.add('mint-batch', {
                ...data,
                quantity,
                batchIndex: i,
                totalBatches: batches,
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            });
            jobs.push(job.id);
        }
        return {
            jobIds: jobs,
            status: 'queued',
            batches,
            totalQuantity: data.quantity,
        };
    }
    async processMintJob(job) {
        const { data } = job;
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const ticketIds = [];
            const quantity = data.quantity || 1;
            for (let i = 0; i < quantity; i++) {
                ticketIds.push({
                    ticketId: Date.now() + i,
                    ticketPDA: this.generateMockPDA(),
                    transactionId: this.generateMockTxId(),
                });
            }
            this.logger.log(`Successfully minted ${quantity} tickets`);
            return {
                success: true,
                ticketIds,
                eventId: data.eventId,
                buyerWallet: data.buyerWallet,
            };
        }
        catch (error) {
            this.logger.error(`Minting failed: ${error.message}`);
            throw error;
        }
    }
    async getMintingStatus(jobId) {
        const job = await this.mintingQueue.getJob(jobId);
        if (!job) {
            return null;
        }
        const state = await job.getState();
        const progress = job.progress;
        return {
            jobId,
            state,
            progress,
            data: job.data,
            result: job.returnvalue,
            failedReason: job.failedReason,
        };
    }
    generateMockPDA() {
        return bs58_1.default.encode(Buffer.from(new Uint8Array(32).map(() => Math.floor(Math.random() * 256))));
    }
    generateMockTxId() {
        return bs58_1.default.encode(Buffer.from(new Uint8Array(64).map(() => Math.floor(Math.random() * 256))));
    }
};
exports.MintingService = MintingService;
exports.MintingService = MintingService = MintingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_2.InjectQueue)('minting')),
    __metadata("design:paramtypes", [bullmq_1.Queue])
], MintingService);
//# sourceMappingURL=mintingService.js.map