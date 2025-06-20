"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const custodialWallet_1 = require("./services/walletManager/custodialWallet");
const phantomIntegration_1 = require("./services/walletManager/phantomIntegration");
const walletMigration_1 = require("./services/walletManager/walletMigration");
const keyEncryption_1 = require("./services/walletManager/keyEncryption");
const walletAnalytics_1 = require("./services/walletManager/walletAnalytics");
const wallet_controller_1 = require("./controllers/wallet.controller");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'wallet-migration' }, { name: 'analytics' }),
        ],
        controllers: [wallet_controller_1.WalletController],
        providers: [
            custodialWallet_1.CustodialWalletService,
            phantomIntegration_1.PhantomIntegrationService,
            walletMigration_1.WalletMigrationService,
            keyEncryption_1.KeyEncryptionService,
            walletAnalytics_1.WalletAnalyticsService,
        ],
        exports: [
            custodialWallet_1.CustodialWalletService,
            phantomIntegration_1.PhantomIntegrationService,
            walletMigration_1.WalletMigrationService,
        ],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map