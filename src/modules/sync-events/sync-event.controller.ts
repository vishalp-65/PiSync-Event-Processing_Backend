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

@Controller('api')
export class SyncEventController {
  constructor(private readonly syncEventService: SyncEventService) {}

  @Post('sync-event')
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
