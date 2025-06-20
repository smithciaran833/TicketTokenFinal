"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var QRService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = __importStar(require("qrcode"));
const crypto_1 = require("crypto");
let QRService = QRService_1 = class QRService {
    constructor() {
        this.logger = new common_1.Logger(QRService_1.name);
    }
    async generateTicketQR(data) {
        try {
            const verificationCode = this.generateVerificationCode(data.ticketPDA, data.owner, data.eventDate);
            const qrData = {
                v: 1,
                t: data.ticketPDA,
                e: data.eventId,
                o: data.owner.substring(0, 8),
                c: verificationCode,
                d: data.eventDate.getTime(),
            };
            const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
            const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData));
            this.logger.log(`Generated QR code for ticket ${data.ticketId}`);
            return {
                qrDataUrl,
                qrBuffer,
                verificationCode,
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate QR code: ${error.message}`);
            throw error;
        }
    }
    async generateEventQR(eventId, eventPDA) {
        const eventUrl = `${process.env.FRONTEND_URL || 'https://tickettoken.io'}/events/${eventId}`;
        return QRCode.toDataURL(eventUrl);
    }
    validateQRData(qrData) {
        try {
            const parsed = JSON.parse(qrData);
            if (!parsed.v || !parsed.t || !parsed.e || !parsed.c) {
                return {
                    isValid: false,
                    error: 'Missing required fields',
                };
            }
            if (parsed.v !== 1) {
                return {
                    isValid: false,
                    error: 'Unsupported QR version',
                };
            }
            return {
                isValid: true,
                data: parsed,
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: 'Invalid QR format',
            };
        }
    }
    verifyOfflineCode(ticketPDA, owner, eventDate, providedCode) {
        const expectedCode = this.generateVerificationCode(ticketPDA, owner, eventDate);
        return expectedCode === providedCode;
    }
    generateVerificationCode(ticketPDA, owner, eventDate) {
        const secret = process.env.QR_SECRET || 'default-secret-change-in-production';
        const data = `${ticketPDA}-${owner}-${eventDate.toISOString()}-${secret}`;
        const hash = (0, crypto_1.createHash)('sha256').update(data).digest('hex');
        return hash.substring(0, 8).toUpperCase();
    }
    async generateBulkQRCodes(tickets) {
        const results = new Map();
        const concurrency = 10;
        for (let i = 0; i < tickets.length; i += concurrency) {
            const batch = tickets.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(ticket => this.generateTicketQR(ticket)));
            batch.forEach((ticket, index) => {
                results.set(ticket.ticketId, {
                    qrDataUrl: batchResults[index].qrDataUrl,
                    verificationCode: batchResults[index].verificationCode,
                });
            });
        }
        return results;
    }
};
exports.QRService = QRService;
exports.QRService = QRService = QRService_1 = __decorate([
    (0, common_1.Injectable)()
], QRService);
//# sourceMappingURL=qrService.js.map