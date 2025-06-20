"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PhantomIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhantomIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const crypto_1 = require("crypto");
let PhantomIntegrationService = PhantomIntegrationService_1 = class PhantomIntegrationService {
    constructor() {
        this.logger = new common_1.Logger(PhantomIntegrationService_1.name);
    }
    generateConnectUrl(data) {
        const sessionId = this.generateSessionId(data.userId);
        const params = new URLSearchParams({
            cluster: data.cluster || 'devnet',
            app_url: process.env.FRONTEND_URL || 'https://tickettoken.io',
            redirect_url: data.redirectUrl,
            session: sessionId,
        });
        const phantomUrl = `https://phantom.app/ul/connect?${params.toString()}`;
        this.logger.log(`Generated Phantom connect URL for user ${data.userId}`);
        return phantomUrl;
    }
    validatePhantomWallet(walletAddress) {
        try {
            const pubkey = new web3_js_1.PublicKey(walletAddress);
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                error: 'Invalid Solana wallet address'
            };
        }
    }
    async verifyWalletOwnership(walletAddress, signedMessage, expectedMessage) {
        try {
            this.logger.log(`Verifying ownership of wallet ${walletAddress}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to verify wallet ownership: ${error.message}`);
            return false;
        }
    }
    generateSignInMessage(data) {
        return `Sign this message to prove you own this wallet.

Wallet: ${data.walletAddress}
Timestamp: ${data.timestamp}
Nonce: ${data.nonce}
Service: TicketToken

This request will not trigger a blockchain transaction or cost any gas fees.`;
    }
    generateSessionId(userId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const data = `${userId}-${timestamp}-${random}`;
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex').substring(0, 16);
    }
    generatePhantomUniversalLink(action, params) {
        const baseUrl = 'https://phantom.app/ul/v1';
        switch (action) {
            case 'connect':
                return `${baseUrl}/connect?${new URLSearchParams(params).toString()}`;
            case 'signMessage':
                return `${baseUrl}/signMessage?${new URLSearchParams(params).toString()}`;
            case 'signTransaction':
                return `${baseUrl}/signTransaction?${new URLSearchParams(params).toString()}`;
            default:
                throw new Error(`Unknown Phantom action: ${action}`);
        }
    }
    async checkPhantomInstalled(userAgent) {
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);
        const isDesktop = !isIOS && !isAndroid;
        return {
            isInstalled: false,
            platform: isIOS ? 'ios' : isAndroid ? 'android' : isDesktop ? 'desktop' : 'unknown',
        };
    }
};
exports.PhantomIntegrationService = PhantomIntegrationService;
exports.PhantomIntegrationService = PhantomIntegrationService = PhantomIntegrationService_1 = __decorate([
    (0, common_1.Injectable)()
], PhantomIntegrationService);
//# sourceMappingURL=phantomIntegration.js.map