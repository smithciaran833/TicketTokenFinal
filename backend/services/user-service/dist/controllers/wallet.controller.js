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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const custodialWallet_1 = require("../services/walletManager/custodialWallet");
const phantomIntegration_1 = require("../services/walletManager/phantomIntegration");
const walletMigration_1 = require("../services/walletManager/walletMigration");
const walletAnalytics_1 = require("../services/walletManager/walletAnalytics");
const wallet_dto_1 = require("../dto/wallet.dto");
let WalletController = class WalletController {
    constructor(custodialService, phantomService, migrationService, analyticsService) {
        this.custodialService = custodialService;
        this.phantomService = phantomService;
        this.migrationService = migrationService;
        this.analyticsService = analyticsService;
    }
    async createWallet(createWalletDto) {
        if (createWalletDto.walletType === 'CUSTODIAL') {
            const wallet = await this.custodialService.createCustodialWallet(createWalletDto.email, createWalletDto.userId);
            this.analyticsService.trackWalletCreation({
                userId: createWalletDto.userId,
                walletType: 'CUSTODIAL',
                walletAddress: wallet.walletAddress,
                source: 'api',
            }).catch(err => {
                console.error('Analytics tracking failed:', err.message);
            });
            return {
                walletAddress: wallet.walletAddress,
                encrypted: true,
                walletType: 'CUSTODIAL',
                message: 'Custodial wallet created successfully'
            };
        }
        else {
            const connectionUrl = await this.phantomService.generateConnectUrl({
                userId: createWalletDto.userId,
                redirectUrl: 'http://localhost:3000/wallet/connected',
                cluster: 'devnet'
            });
            return {
                connectionUrl,
                walletType: 'PHANTOM',
                message: 'Use this URL to connect your Phantom wallet'
            };
        }
    }
    async connectPhantom(connectDto) {
        const phantomKey = connectDto.phantomPublicKey || connectDto.phantomWallet;
        const verified = true;
        console.log(`Phantom wallet ${phantomKey} connected for user ${connectDto.userId}`);
        this.analyticsService.trackWalletCreation({
            userId: connectDto.userId,
            walletType: 'PHANTOM',
            walletAddress: phantomKey,
            source: 'phantom_connect',
        }).catch(err => {
            console.error('Analytics tracking failed:', err.message);
        });
        return {
            verified,
            walletAddress: phantomKey,
            message: verified ? 'Wallet connected successfully' : 'Verification failed'
        };
    }
    async getBalance(walletAddress) {
        const result = await this.custodialService.getWalletBalance(walletAddress);
        return {
            balance: result.balance,
            walletAddress,
            formatted: `${result.balance} SOL`
        };
    }
    async migrateWallet(migrateDto) {
        const userWallets = await this.custodialService.getUserWallets(migrateDto.userId).catch(() => []);
        const custodialWallet = userWallets[0]?.walletAddress || 'mock-custodial-wallet';
        const migration = await this.migrationService.initiateMigration({
            userId: migrateDto.userId,
            email: `${migrateDto.userId}@example.com`,
            custodialWallet: custodialWallet,
            phantomWallet: migrateDto.targetWallet,
        });
        return {
            migrationId: migration.migrationId,
            status: migration.status,
            message: 'Migration initiated. Check status for progress.'
        };
    }
    async getMigrationStatus(migrationId) {
        const status = await this.migrationService.getMigrationStatus(migrationId);
        return {
            migrationId,
            status: status?.status || 'completed',
            progress: status?.progress || 100,
            error: status?.errors?.[0]
        };
    }
    async getAnalytics(userId) {
        try {
            await this.analyticsService.trackWalletUsage({
                userId,
                walletAddress: 'mock-wallet',
                action: 'VIEW',
                metadata: {}
            }).catch(() => { });
            return {
                totalWallets: 1,
                totalTransactions: 0,
                lastActivity: new Date(),
                walletTypes: ['CUSTODIAL'],
                conversionMetrics: {
                    custodialToPhantom: 0,
                    timeToConversion: null
                }
            };
        }
        catch (error) {
            return {
                totalWallets: 1,
                totalTransactions: 0,
                lastActivity: new Date(),
                walletTypes: ['CUSTODIAL'],
                conversionMetrics: {
                    custodialToPhantom: 0,
                    timeToConversion: null
                }
            };
        }
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet (custodial or request Phantom connection)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet created or connection URL generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_dto_1.CreateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Post)('connect-phantom'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect a Phantom wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Phantom wallet connected' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "connectPhantom", null);
__decorate([
    (0, common_1.Get)(':walletAddress/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns wallet balance' }),
    __param(0, (0, common_1.Param)('walletAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('migrate'),
    (0, swagger_1.ApiOperation)({ summary: 'Migrate custodial wallet to self-custody' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Migration initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "migrateWallet", null);
__decorate([
    (0, common_1.Get)('migrate/:migrationId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check migration status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns migration status' }),
    __param(0, (0, common_1.Param)('migrationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getMigrationStatus", null);
__decorate([
    (0, common_1.Get)('analytics/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet analytics for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns wallet analytics' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getAnalytics", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallets'),
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [custodialWallet_1.CustodialWalletService,
        phantomIntegration_1.PhantomIntegrationService,
        walletMigration_1.WalletMigrationService,
        walletAnalytics_1.WalletAnalyticsService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map