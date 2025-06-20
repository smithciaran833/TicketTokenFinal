"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModule = void 0;
const common_1 = require("@nestjs/common");
const eventController_1 = require("./controllers/eventController");
const venueController_1 = require("./controllers/venueController");
const scheduleController_1 = require("./controllers/scheduleController");
const eventService_1 = require("./services/eventService");
const venueService_1 = require("./services/venueService");
const tierService_1 = require("./services/tierService");
const capacityManager_1 = require("./services/capacityManager");
const pricingEngine_1 = require("./services/pricingEngine");
const scheduleService_1 = require("./services/scheduleService");
let EventModule = class EventModule {
};
exports.EventModule = EventModule;
exports.EventModule = EventModule = __decorate([
    (0, common_1.Module)({
        controllers: [eventController_1.EventController, venueController_1.VenueController, scheduleController_1.ScheduleController],
        providers: [
            eventService_1.EventService,
            venueService_1.VenueService,
            tierService_1.TierService,
            capacityManager_1.CapacityManager,
            pricingEngine_1.PricingEngine,
            scheduleService_1.ScheduleService,
        ],
        exports: [eventService_1.EventService, venueService_1.VenueService, tierService_1.TierService],
    })
], EventModule);
//# sourceMappingURL=event.module.js.map