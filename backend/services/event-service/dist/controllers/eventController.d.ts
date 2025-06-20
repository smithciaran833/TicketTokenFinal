import { EventService } from '../services/eventService';
import { CreateEventDto, UpdateEventDto, EventFilterDto } from '../dto/event.dto';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    create(createEventDto: CreateEventDto): Promise<any>;
    findAll(filters: EventFilterDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<any>;
    cancel(id: string, reason: string): Promise<any>;
    getCapacity(id: string): Promise<{
        total: number;
        sold: number;
        available: number;
        percentageSold: number;
    }>;
    syncFromBlockchain(id: string): Promise<{
        message: string;
    }>;
    private serializeEvent;
}
