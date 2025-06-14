import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';

import { SyncEventService } from './services/sync-event.service';
import { CreateSyncEventDto } from './dto/create-sync-event.dto';
import {
  SyncEventResponseDto,
  SyncHistoryResponseDto,
} from './dto/sync-event-response.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from 'src/common/decorators/api-response.decorators';

@ApiTags('sync-events')
@Controller('api')
export class SyncEventController {
  constructor(private readonly syncEventService: SyncEventService) {}

  @Post('sync-event')
  @ApiOperation({ summary: 'Create a new sync event' })
  @ApiSuccessResponse(SyncEventResponseDto, 'Sync event created successfully')
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createSyncEvent(
    @Body() createSyncEventDto: CreateSyncEventDto,
  ): Promise<any> {
    const event =
      await this.syncEventService.createSyncEvent(createSyncEventDto);
    return {
      success: true,
      message: 'Sync event created successfully',
      data: event,
    };
  }

  @Get('device/:id/sync-history')
  @ApiOperation({ summary: 'Get sync history for a specific device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 50,
  })
  @ApiSuccessResponse(
    SyncHistoryResponseDto,
    'Device sync history retrieved successfully',
  )
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Device not found',
  })
  async getDeviceSyncHistory(
    @Param('id') deviceId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ): Promise<any> {
    const history = await this.syncEventService.getDeviceSyncHistory(
      deviceId,
      page,
      limit,
    );
    return {
      success: true,
      message: 'Device sync history retrieved successfully',
      data: history,
    };
  }

  @Get('devices/repeated-failures')
  @ApiOperation({ summary: 'Get devices with repeated sync failures' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    description: 'Failure threshold',
    example: 3,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Devices with repeated failures retrieved successfully',
  })
  async getDevicesWithRepeatedFailures(
    @Query('threshold') threshold: number = 3,
  ): Promise<any> {
    const devices =
      await this.syncEventService.getDevicesWithRepeatedFailures(threshold);
    return {
      success: true,
      message: 'Devices with repeated failures retrieved successfully',
      data: devices,
    };
  }

  @Get('device/:id/stats')
  @ApiOperation({ summary: 'Get sync statistics for a specific device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze',
    example: 30,
  })
  async getDeviceStats(
    @Param('id') deviceId: string,
    @Query('days') days: number = 30,
  ): Promise<any> {
    const stats = await this.syncEventService.getDeviceStats(deviceId, days);
    return {
      success: true,
      message: 'Device statistics retrieved successfully',
      data: stats,
    };
  }
}
