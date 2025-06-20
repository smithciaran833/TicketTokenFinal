import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from '../services/eventService';
import { CreateEventDto, UpdateEventDto, EventFilterDto } from '../dto/event.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createEventDto: CreateEventDto) {
    const event = await this.eventService.createEvent({
      ...createEventDto,
      startTime: new Date(createEventDto.startTime),
      endTime: new Date(createEventDto.endTime),
    });

    // Convert BigInt to string for JSON serialization
    return this.serializeEvent(event);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'Returns all events' })
  async findAll(@Query() filters: EventFilterDto) {
    const events = await this.eventService.findAll({
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    return events.map(event => this.serializeEvent(event));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Returns the event' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    return this.serializeEvent(event);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    const event = await this.eventService.update(id, {
      ...updateEventDto,
      startTime: updateEventDto.startTime ? new Date(updateEventDto.startTime) : undefined,
      endTime: updateEventDto.endTime ? new Date(updateEventDto.endTime) : undefined,
    });

    return this.serializeEvent(event);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an event' })
  @ApiResponse({ status: 200, description: 'Event cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async cancel(@Param('id') id: string, @Body('reason') reason: string) {
    const event = await this.eventService.cancel(id, reason);
    return this.serializeEvent(event);
  }

  @Get(':id/capacity')
  @ApiOperation({ summary: 'Get event capacity information' })
  @ApiResponse({ status: 200, description: 'Returns capacity details' })
  async getCapacity(@Param('id') id: string) {
    return this.eventService.getCapacity(id);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync event from blockchain' })
  @ApiResponse({ status: 200, description: 'Event synced successfully' })
  async syncFromBlockchain(@Param('id') id: string) {
    await this.eventService.syncFromBlockchain(id);
    return { message: 'Sync initiated' };
  }

  // Helper method to serialize BigInt values
  private serializeEvent(event: any) {
    return {
      ...event,
      eventId: event.eventId?.toString(),
      generalPrice: event.generalPrice?.toString(),
      vipPrice: event.vipPrice?.toString(),
      tiers: event.tiers?.map((tier: any) => ({
        ...tier,
        price: tier.price?.toString(),
        minPrice: tier.minPrice?.toString(),
        maxPrice: tier.maxPrice?.toString(),
      })),
    };
  }
}
