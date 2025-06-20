import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseFloatPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VenueService } from '../services/venueService';
import { CreateVenueDto, UpdateVenueDto } from '../dto/venue.dto';

@ApiTags('Venues')
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiResponse({ status: 201, description: 'Venue created successfully' })
  @ApiResponse({ status: 409, description: 'Venue already exists at location' })
  async create(@Body() createVenueDto: CreateVenueDto) {
    return this.venueService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all venues' })
  @ApiResponse({ status: 200, description: 'Returns all venues' })
  async findAll() {
    return this.venueService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue by ID' })
  @ApiResponse({ status: 200, description: 'Returns the venue' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async findOne(@Param('id') id: string) {
    return this.venueService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a venue' })
  @ApiResponse({ status: 200, description: 'Venue updated successfully' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    return this.venueService.update(id, updateVenueDto);
  }
}
