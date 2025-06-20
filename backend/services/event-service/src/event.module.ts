import { Module } from '@nestjs/common';
import { EventController } from './controllers/eventController';
import { VenueController } from './controllers/venueController';
import { ScheduleController } from './controllers/scheduleController';
import { EventService } from './services/eventService';
import { VenueService } from './services/venueService';
import { TierService } from './services/tierService';
import { CapacityManager } from './services/capacityManager';
import { PricingEngine } from './services/pricingEngine';
import { ScheduleService } from './services/scheduleService';

@Module({
  controllers: [EventController, VenueController, ScheduleController],
  providers: [
    EventService,
    VenueService,
    TierService,
    CapacityManager,
    PricingEngine,
    ScheduleService,
  ],
  exports: [EventService, VenueService, TierService],
})
export class EventModule {}
