import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ScheduleService } from '../services/scheduleService';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('recurring')
  @ApiOperation({ summary: 'Create recurring events from template' })
  @ApiResponse({ status: 201, description: 'Recurring events created' })
  async createRecurring(@Body() data: {
    templateEventId: string;
    recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    recurrenceCount: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
  }) {
    return this.scheduleService.createRecurringEvents(data);
  }

  @Get('venue/:venueId')
  @ApiOperation({ summary: 'Get venue event schedule' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getVenueSchedule(
    @Param('venueId') venueId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.scheduleService.getEventSchedule(
      venueId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('venue/:venueId/slots')
  @ApiOperation({ summary: 'Find available time slots' })
  @ApiQuery({ name: 'duration', required: true, description: 'Duration in hours' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async findAvailableSlots(
    @Param('venueId') venueId: string,
    @Query('duration') duration: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.scheduleService.findAvailableSlots(
      venueId,
      parseInt(duration),
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('check-conflicts')
  @ApiOperation({ summary: 'Check for scheduling conflicts' })
  async checkConflicts(@Body() data: {
    venueId: string;
    startTime: string;
    endTime: string;
    excludeEventId?: string;
  }) {
    const hasConflicts = await this.scheduleService.checkConflicts(
      data.venueId,
      new Date(data.startTime),
      new Date(data.endTime),
      data.excludeEventId
    );
    
    return { hasConflicts };
  }
}
