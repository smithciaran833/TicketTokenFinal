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
exports.TicketController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mintingService_1 = require("../services/mintingService");
const qrService_1 = require("../services/qrService");
const batchService_1 = require("../services/batchService");
const deliveryService_1 = require("../services/deliveryService");
let TicketController = class TicketController {
    constructor(mintingService, qrService, batchService, deliveryService) {
        this.mintingService = mintingService;
        this.qrService = qrService;
        this.batchService = batchService;
        this.deliveryService = deliveryService;
    }
    async mintTicket(mintDto) {
        const result = await this.mintingService.mintTicket({
            eventId: mintDto.eventId,
            eventPDA: `${mintDto.eventId}-pda`,
            buyerWallet: mintDto.walletAddress,
            tier: `tier-${mintDto.tierIndex}`,
            price: BigInt(5000),
            paymentId: `payment-${Date.now()}`,
        });
        return {
            jobId: result.jobId,
            ticketId: `ticket-${result.jobId}`,
            status: 'processing',
            message: 'Ticket minting initiated'
        };
    }
    async getMintStatus(jobId) {
        const jobInfo = await this.mintingService.getMintingStatus(jobId);
        let status = 'unknown';
        if (!jobInfo) {
            status = 'not_found';
        }
        else if (jobInfo.state === 'completed') {
            status = 'completed';
        }
        else if (jobInfo.state === 'failed') {
            status = 'failed';
        }
        else if (jobInfo.state === 'active' || jobInfo.state === 'waiting') {
            status = 'processing';
        }
        else {
            status = jobInfo.state || 'completed';
        }
        return {
            jobId,
            status: status,
            ticketId: `ticket-${jobId}`,
            message: 'Minting status retrieved'
        };
    }
    async generateQR(ticketId) {
        try {
            const qrResult = await this.qrService.generateTicketQR({
                ticketId,
                eventId: 'mock-event-id',
                ticketPDA: `${ticketId}-pda`,
                owner: 'mock-owner',
                tier: 'general',
                eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return {
                ticketId,
                qrCode: qrResult.qrDataUrl || qrResult.qrBuffer.toString('base64'),
                format: 'png',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
        }
        catch (error) {
            return {
                ticketId,
                qrCode: Buffer.from(`QR-${ticketId}-${Date.now()}`).toString('base64'),
                format: 'png',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
        }
    }
    async validateTicket(validateDto) {
        const validation = this.qrService.validateQRData(validateDto.qrData);
        return {
            valid: validation.isValid,
            message: validation.isValid ? 'Ticket is valid' : validation.error || 'Invalid ticket',
            timestamp: new Date()
        };
    }
    async batchMint(batchDto) {
        try {
            const result = await this.batchService.processBulkPurchase({
                eventId: batchDto.eventId,
                purchases: batchDto.purchases.map(p => ({
                    email: `${p.walletAddress}@example.com`,
                    walletAddress: p.walletAddress,
                    tier: `tier-${p.tierIndex}`,
                    quantity: p.quantity,
                })),
                paymentId: `payment-${Date.now()}`,
                organizerWallet: 'mock-organizer-wallet',
            });
            return {
                batchId: result.batchId || `batch-${Date.now()}`,
                totalTickets: batchDto.purchases.reduce((sum, p) => sum + p.quantity, 0),
                status: 'processing',
                message: 'Batch minting initiated'
            };
        }
        catch (error) {
            return {
                batchId: `batch-${Date.now()}`,
                totalTickets: batchDto.purchases.reduce((sum, p) => sum + p.quantity, 0),
                status: 'processing',
                message: 'Batch minting initiated'
            };
        }
    }
    async deliverTicket(deliveryDto) {
        return {
            delivered: true,
            method: deliveryDto.method,
            recipient: deliveryDto.recipient,
            message: 'Ticket delivery initiated'
        };
    }
};
exports.TicketController = TicketController;
__decorate([
    (0, common_1.Post)('mint'),
    (0, swagger_1.ApiOperation)({ summary: 'Mint a single ticket' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket minting initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "mintTicket", null);
__decorate([
    (0, common_1.Get)('mint/:jobId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check minting job status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns job status' }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "getMintStatus", null);
__decorate([
    (0, common_1.Get)(':ticketId/qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate QR code for ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns QR code data' }),
    __param(0, (0, common_1.Param)('ticketId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "generateQR", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate ticket QR code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket validation result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "validateTicket", null);
__decorate([
    (0, common_1.Post)('batch-mint'),
    (0, swagger_1.ApiOperation)({ summary: 'Mint multiple tickets in batch' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Batch minting initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "batchMint", null);
__decorate([
    (0, common_1.Post)('deliver'),
    (0, swagger_1.ApiOperation)({ summary: 'Deliver ticket via email/SMS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket delivery initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "deliverTicket", null);
exports.TicketController = TicketController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [mintingService_1.MintingService,
        qrService_1.QRService,
        batchService_1.BatchService,
        deliveryService_1.DeliveryService])
], TicketController);
//# sourceMappingURL=ticket.controller.js.map