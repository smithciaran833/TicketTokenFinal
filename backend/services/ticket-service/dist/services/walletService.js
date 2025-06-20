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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const crypto_1 = require("crypto");
let WalletService = WalletService_1 = class WalletService {
    constructor() {
        this.logger = new common_1.Logger(WalletService_1.name);
        this.connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
        if (process.env.TREASURY_WALLET_SEED) {
            const seed = (0, crypto_1.createHash)('sha256')
                .update(process.env.TREASURY_WALLET_SEED)
                .digest()
                .slice(0, 32);
            this.treasuryKeypair = web3_js_1.Keypair.fromSeed(seed);
            this.logger.log(`Treasury wallet: ${this.treasuryKeypair.publicKey.toBase58()}`);
        }
    }
    async createCustodialWallet(userId) {
        try {
            const seed = (0, crypto_1.createHash)('sha256')
                .update(`${process.env.WALLET_SEED_PREFIX || 'tickettoken'}-${userId}`)
                .digest()
                .slice(0, 32);
            const keypair = web3_js_1.Keypair.fromSeed(seed);
            const encryptedPrivateKey = this.encryptPrivateKey(keypair.secretKey);
            this.logger.log(`Created custodial wallet for user ${userId}: ${keypair.publicKey.toBase58()}`);
            return {
                publicKey: keypair.publicKey.toBase58(),
                encryptedPrivateKey,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create custodial wallet: ${error.message}`);
            throw error;
        }
    }
    async getCustodialWalletBalance(publicKey) {
        try {
            const balance = await this.connection.getBalance(new web3_js_1.PublicKey(publicKey));
            return balance / 1e9;
        }
        catch (error) {
            this.logger.error(`Failed to get balance: ${error.message}`);
            return 0;
        }
    }
    async createTemporaryWallet() {
        const keypair = web3_js_1.Keypair.generate();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        return {
            publicKey: keypair.publicKey.toBase58(),
            privateKey: bs58_1.default.encode(keypair.secretKey),
            expiresAt,
        };
    }
    async prepareMigrationToPhantom(custodialWalletPublicKey, phantomWalletPublicKey) {
        const migrationId = (0, crypto_1.createHash)('sha256')
            .update(`${custodialWalletPublicKey}-${phantomWalletPublicKey}-${Date.now()}`)
            .digest('hex')
            .substring(0, 16);
        this.logger.log(`Prepared migration ${migrationId} from ${custodialWalletPublicKey} to ${phantomWalletPublicKey}`);
        return {
            migrationId,
            custodialWallet: custodialWalletPublicKey,
            phantomWallet: phantomWalletPublicKey,
            status: 'prepared',
        };
    }
    validateSolanaAddress(address) {
        try {
            new web3_js_1.PublicKey(address);
            return true;
        }
        catch {
            return false;
        }
    }
    async checkWalletExists(publicKey) {
        try {
            const accountInfo = await this.connection.getAccountInfo(new web3_js_1.PublicKey(publicKey));
            return accountInfo !== null;
        }
        catch (error) {
            this.logger.error(`Failed to check wallet: ${error.message}`);
            return false;
        }
    }
    encryptPrivateKey(privateKey) {
        const base64 = Buffer.from(privateKey).toString('base64');
        return `encrypted:${base64}`;
    }
    decryptPrivateKey(encryptedKey) {
        const base64 = encryptedKey.replace('encrypted:', '');
        return new Uint8Array(Buffer.from(base64, 'base64'));
    }
    getTreasuryWallet() {
        return this.treasuryKeypair?.publicKey.toBase58() || '';
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WalletService);
//# sourceMappingURL=walletService.js.map