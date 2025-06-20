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
var WalletMigrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletMigrationService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const web3_js_1 = require("@solana/web3.js");
let WalletMigrationService = WalletMigrationService_1 = class WalletMigrationService {
    constructor(migrationQueue) {
        this.migrationQueue = migrationQueue;
        this.logger = new common_1.Logger(WalletMigrationService_1.name);
        this.connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    }
    async initiateMigration(data) {
        try {
            const migrationId = this.generateMigrationId(data.userId, data.custodialWallet, data.phantomWallet);
            const job = await this.migrationQueue.add('migrate-wallet', {
                migrationId,
                ...data,
                timestamp: Date.now(),
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });
            this.logger.log(`Initiated migration ${migrationId} for user ${data.userId}`);
            return {
                migrationId,
                status: 'PENDING',
                estimatedTime: '2-5 minutes',
            };
        }
        catch (error) {
            this.logger.error(`Failed to initiate migration: ${error.message}`);
            throw error;
        }
    }
    async getMigrationStatus(migrationId) {
        const job = await this.findMigrationJob(migrationId);
        if (!job) {
            return {
                migrationId,
                status: 'NOT_FOUND',
                progress: 0,
                ticketsMigrated: 0,
                totalTickets: 0,
            };
        }
        const state = await job.getState();
        const progress = job.progress || 0;
        return {
            migrationId,
            status: state.toUpperCase(),
            progress,
            ticketsMigrated: job.returnvalue?.ticketsMigrated || 0,
            totalTickets: job.data.totalTickets || 0,
            errors: job.failedReason ? [job.failedReason] : undefined,
        };
    }
    async processMigration(job) {
        const { custodialWallet, phantomWallet, userId } = job.data;
        try {
            const tickets = await this.getWalletTickets(custodialWallet);
            job.data.totalTickets = tickets.length;
            this.logger.log(`Found ${tickets.length} tickets to migrate`);
            const failedTransfers = [];
            let successCount = 0;
            for (let i = 0; i < tickets.length; i++) {
                try {
                    await this.transferTicket(tickets[i], custodialWallet, phantomWallet);
                    successCount++;
                    await job.updateProgress((i + 1) / tickets.length * 100);
                }
                catch (error) {
                    this.logger.error(`Failed to transfer ticket ${tickets[i]}: ${error.message}`);
                    failedTransfers.push(tickets[i]);
                }
            }
            await this.updateUserWalletPreference(userId, phantomWallet);
            return {
                success: failedTransfers.length === 0,
                ticketsMigrated: successCount,
                failedTransfers,
            };
        }
        catch (error) {
            this.logger.error(`Migration failed: ${error.message}`);
            throw error;
        }
    }
    async rollbackMigration(migrationId) {
        try {
            const job = await this.findMigrationJob(migrationId);
            if (job) {
                const state = await job.getState();
                if (state === 'waiting' || state === 'active') {
                    await job.remove();
                    this.logger.log(`Cancelled migration ${migrationId}`);
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Failed to rollback migration: ${error.message}`);
            return false;
        }
    }
    generateMigrationId(userId, from, to) {
        const timestamp = Date.now();
        const data = `${userId}-${from}-${to}-${timestamp}`;
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex').substring(0, 16);
    }
    async getWalletTickets(walletAddress) {
        return [
            'ticket-pda-1',
            'ticket-pda-2',
            'ticket-pda-3',
        ];
    }
    async transferTicket(ticketPDA, from, to) {
        this.logger.log(`Transferring ticket ${ticketPDA} from ${from} to ${to}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    async updateUserWalletPreference(userId, walletAddress) {
        this.logger.log(`Updated user ${userId} preferred wallet to ${walletAddress}`);
    }
    async findMigrationJob(migrationId) {
        const jobs = await this.migrationQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
        return jobs.find(j => j.data.migrationId === migrationId);
    }
};
exports.WalletMigrationService = WalletMigrationService;
exports.WalletMigrationService = WalletMigrationService = WalletMigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_2.InjectQueue)('wallet-migration')),
    __metadata("design:paramtypes", [bullmq_1.Queue])
], WalletMigrationService);
const crypto_1 = require("crypto");
//# sourceMappingURL=walletMigration.js.map