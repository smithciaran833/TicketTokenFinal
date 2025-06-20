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
var WalletAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let WalletAnalyticsService = WalletAnalyticsService_1 = class WalletAnalyticsService {
    constructor(analyticsQueue) {
        this.analyticsQueue = analyticsQueue;
        this.logger = new common_1.Logger(WalletAnalyticsService_1.name);
    }
    async trackWalletCreation(data) {
        await this.analyticsQueue.add('wallet-created', {
            ...data,
            timestamp: new Date(),
            eventType: 'WALLET_CREATED',
        });
        this.logger.log(`Tracked wallet creation: ${data.walletType} for user ${data.userId}`);
    }
    async trackMigration(data) {
        await this.analyticsQueue.add('wallet-migrated', {
            ...data,
            timestamp: new Date(),
            eventType: 'WALLET_MIGRATED',
        });
        this.logger.log(`Tracked migration: ${data.success ? 'successful' : 'failed'} for user ${data.userId}`);
    }
    async trackWalletUsage(data) {
        await this.analyticsQueue.add('wallet-usage', {
            ...data,
            timestamp: new Date(),
            eventType: 'WALLET_USAGE',
        });
    }
    async getWalletMetrics(timeframe) {
        const mockData = {
            day: {
                totalWallets: 150,
                custodialWallets: 120,
                phantomWallets: 30,
                migrationsCompleted: 15,
                migrationSuccessRate: 0.93,
                avgMigrationTime: 180000,
                activeWallets: 75,
                conversionRate: 0.20,
            },
            week: {
                totalWallets: 1050,
                custodialWallets: 840,
                phantomWallets: 210,
                migrationsCompleted: 105,
                migrationSuccessRate: 0.91,
                avgMigrationTime: 195000,
                activeWallets: 525,
                conversionRate: 0.20,
            },
            month: {
                totalWallets: 4500,
                custodialWallets: 3600,
                phantomWallets: 900,
                migrationsCompleted: 450,
                migrationSuccessRate: 0.89,
                avgMigrationTime: 210000,
                activeWallets: 2250,
                conversionRate: 0.20,
            },
            all: {
                totalWallets: 12000,
                custodialWallets: 9000,
                phantomWallets: 3000,
                migrationsCompleted: 1500,
                migrationSuccessRate: 0.88,
                avgMigrationTime: 225000,
                activeWallets: 6000,
                conversionRate: 0.25,
            },
        };
        return mockData[timeframe];
    }
    async getUserWalletJourney(userId) {
        return {
            userId,
            journey: [
                {
                    timestamp: new Date('2024-01-15'),
                    event: 'WALLET_CREATED',
                    walletType: 'CUSTODIAL',
                    details: { source: 'signup' },
                },
                {
                    timestamp: new Date('2024-01-20'),
                    event: 'FIRST_PURCHASE',
                    walletType: 'CUSTODIAL',
                    details: { amount: '$50' },
                },
                {
                    timestamp: new Date('2024-02-01'),
                    event: 'MIGRATION_STARTED',
                    walletType: 'PHANTOM',
                    details: { reason: 'user_initiated' },
                },
                {
                    timestamp: new Date('2024-02-01'),
                    event: 'MIGRATION_COMPLETED',
                    walletType: 'PHANTOM',
                    details: { duration: '3m 45s', ticketsMigrated: 5 },
                },
            ],
            currentWalletType: 'PHANTOM',
            totalTransactions: 23,
            migrationAttempts: 1,
        };
    }
    async getConversionFunnel(dateRange) {
        return {
            stages: [
                {
                    stage: 'Custodial Wallet Created',
                    count: 10000,
                    percentage: 100,
                    avgTimeToNext: 168,
                },
                {
                    stage: 'First Transaction Complete',
                    count: 8500,
                    percentage: 85,
                    avgTimeToNext: 336,
                },
                {
                    stage: 'Migration Page Viewed',
                    count: 3400,
                    percentage: 34,
                    avgTimeToNext: 24,
                },
                {
                    stage: 'Migration Started',
                    count: 2550,
                    percentage: 25.5,
                    avgTimeToNext: 0.1,
                },
                {
                    stage: 'Migration Completed',
                    count: 2300,
                    percentage: 23,
                    avgTimeToNext: 0,
                },
            ],
            overallConversion: 0.23,
        };
    }
    async generateWalletReport(params) {
        return {
            summary: {
                totalWalletsCreated: 5000,
                custodialPercentage: 80,
                phantomPercentage: 20,
                migrationSuccessRate: 90,
                avgTimeToMigration: '14 days',
                mostActiveDay: 'Friday',
                peakHour: '7 PM EST',
            },
            timeSeries: [
                {
                    date: new Date('2024-01-01'),
                    custodialCreated: 150,
                    phantomCreated: 30,
                    migrationsCompleted: 25,
                    activeWallets: 450,
                },
            ],
            insights: [
                'Conversion rate increases 40% after users complete 3+ transactions',
                'Migration success rate is highest on weekends (95% vs 88% weekdays)',
                'Users who migrate within 30 days have 3x higher lifetime value',
                'Email reminders after 14 days increase migration rate by 25%',
            ],
        };
    }
    async trackConversionEvent(data) {
        await this.analyticsQueue.add('conversion-event', {
            ...data,
            timestamp: new Date(),
            eventType: 'CONVERSION_EVENT',
        });
        this.logger.log(`Tracked conversion event: ${data.event} for user ${data.userId}`);
    }
};
exports.WalletAnalyticsService = WalletAnalyticsService;
exports.WalletAnalyticsService = WalletAnalyticsService = WalletAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('analytics')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], WalletAnalyticsService);
//# sourceMappingURL=walletAnalytics.js.map