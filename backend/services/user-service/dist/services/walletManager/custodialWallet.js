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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CustodialWalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustodialWalletService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const crypto_1 = require("crypto");
const bs58_1 = __importDefault(require("bs58"));
let CustodialWalletService = CustodialWalletService_1 = class CustodialWalletService {
    constructor() {
        this.logger = new common_1.Logger(CustodialWalletService_1.name);
        this.connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    }
    async createCustodialWallet(email, userId) {
        try {
            const seedString = `${process.env.CUSTODIAL_SEED_PREFIX}-${email}-${userId}`;
            const seed = (0, crypto_1.createHash)('sha256').update(seedString).digest().slice(0, 32);
            const keypair = web3_js_1.Keypair.fromSeed(seed);
            const walletAddress = keypair.publicKey.toBase58();
            const encryptedSeed = await this.encryptSeed(seed);
            this.logger.log(`Created custodial wallet for ${email}: ${walletAddress}`);
            if (process.env.AUTO_FUND_WALLETS === 'true') {
                await this.fundWalletWithMinimumRent(walletAddress);
            }
            return {
                walletAddress,
                encryptedSeed,
                walletType: 'CUSTODIAL',
                createdAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to create custodial wallet: ${error.message}`);
            throw error;
        }
    }
    async getWalletBalance(walletAddress) {
        try {
            const pubkey = new web3_js_1.PublicKey(walletAddress);
            const balance = await this.connection.getBalance(pubkey);
            const minimumRent = await this.connection.getMinimumBalanceForRentExemption(0);
            return {
                balance: balance / 1e9,
                hasMinimumRent: balance >= minimumRent,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get balance: ${error.message}`);
            return { balance: 0, hasMinimumRent: false };
        }
    }
    async signTransaction(walletAddress, encryptedSeed, transaction) {
        try {
            const seed = await this.decryptSeed(encryptedSeed);
            const keypair = web3_js_1.Keypair.fromSeed(seed);
            if (keypair.publicKey.toBase58() !== walletAddress) {
                throw new Error('Wallet address mismatch');
            }
            transaction.sign(keypair);
            return transaction;
        }
        catch (error) {
            this.logger.error(`Failed to sign transaction: ${error.message}`);
            throw error;
        }
    }
    async transferTicketOwnership(fromWallet, fromEncryptedSeed, toWallet, ticketPDA, programId) {
        try {
            this.logger.log(`Transferring ticket ${ticketPDA} from ${fromWallet} to ${toWallet}`);
            const mockTxId = bs58_1.default.encode(Buffer.from(new Uint8Array(64).map(() => Math.floor(Math.random() * 256))));
            return mockTxId;
        }
        catch (error) {
            this.logger.error(`Failed to transfer ticket: ${error.message}`);
            throw error;
        }
    }
    async recoverWallet(email, userId, verificationCode) {
        try {
            const expectedCode = this.generateRecoveryCode(email, userId);
            if (verificationCode !== expectedCode) {
                return { success: false };
            }
            const seedString = `${process.env.CUSTODIAL_SEED_PREFIX}-${email}-${userId}`;
            const seed = (0, crypto_1.createHash)('sha256').update(seedString).digest().slice(0, 32);
            const keypair = web3_js_1.Keypair.fromSeed(seed);
            return {
                success: true,
                walletAddress: keypair.publicKey.toBase58(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to recover wallet: ${error.message}`);
            return { success: false };
        }
    }
    async encryptSeed(seed) {
        const key = process.env.ENCRYPTION_KEY || 'default-key-change-this';
        const encrypted = Buffer.from(seed).toString('base64');
        return `enc:v1:${encrypted}`;
    }
    async decryptSeed(encryptedSeed) {
        const parts = encryptedSeed.split(':');
        if (parts[0] !== 'enc' || parts[1] !== 'v1') {
            throw new Error('Invalid encrypted seed format');
        }
        return new Uint8Array(Buffer.from(parts[2], 'base64'));
    }
    generateRecoveryCode(email, userId) {
        const data = `${email}-${userId}-${process.env.JWT_SECRET}`;
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex').substring(0, 8).toUpperCase();
    }
    async fundWalletWithMinimumRent(walletAddress) {
        this.logger.log(`Would fund wallet ${walletAddress} with minimum rent`);
    }
    async getUserWallets(userId) {
        return [{
                walletAddress: 'mock-custodial-wallet',
                type: 'CUSTODIAL'
            }];
    }
};
exports.CustodialWalletService = CustodialWalletService;
exports.CustodialWalletService = CustodialWalletService = CustodialWalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CustodialWalletService);
//# sourceMappingURL=custodialWallet.js.map