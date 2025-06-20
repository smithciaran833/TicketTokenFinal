"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const ticket_controller_1 = require("./controllers/ticket.controller");
const mintingService_1 = require("./services/mintingService");
const qrService_1 = require("./services/qrService");
const deliveryService_1 = require("./services/deliveryService");
const walletService_1 = require("./services/walletService");
const batchService_1 = require("./services/batchService");
let TicketModule = class TicketModule {
};
exports.TicketModule = TicketModule;
exports.TicketModule = TicketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'minting' }, { name: 'delivery' }, { name: 'batch-operations' }),
        ],
        controllers: [ticket_controller_1.TicketController],
        providers: [
            mintingService_1.MintingService,
            qrService_1.QRService,
            deliveryService_1.DeliveryService,
            walletService_1.WalletService,
            batchService_1.BatchService,
        ],
        exports: [
            mintingService_1.MintingService,
            qrService_1.QRService,
            deliveryService_1.DeliveryService,
        ],
    })
], TicketModule);
//# sourceMappingURL=ticket.module.js.map