import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncEvent, SyncStatus } from '../entities/sync-event.entity';
import { Device } from '../../devices/entities/device.entity';
import { CreateSyncEventDto } from '../dto/create-sync-event.dto';
import { SyncEventRepository } from '../repositories/sync-event.repository';
import { DeviceService } from '../../devices/services/device.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class SyncEventService {
  constructor(
    @InjectRepository(SyncEvent)
    private syncEventRepository: Repository<SyncEvent>,
    private syncEventCustomRepository: SyncEventRepository,
    private deviceService: DeviceService,
    private notificationService: NotificationService,
  ) {}

  async createSyncEvent(
    createSyncEventDto: CreateSyncEventDto,
  ): Promise<SyncEvent> {
    const {
      device_id,
      timestamp,
      total_files_synced,
      total_errors,
      internet_speed,
      sync_duration_ms,
      metadata,
    } = createSyncEventDto;

    // Validate timestamp
    const syncTimestamp = new Date(timestamp);
    if (isNaN(syncTimestamp.getTime())) {
      throw new BadRequestException('Invalid timestamp format');
    }

    // Determine sync status based on errors and files synced
    let status: SyncStatus;
    if (total_errors === 0 && total_files_synced > 0) {
      status = SyncStatus.SUCCESS;
    } else if (total_errors > 0 && total_files_synced > 0) {
      status = SyncStatus.PARTIAL;
    } else {
      status = SyncStatus.FAILED;
    }

    // Create sync event
    const syncEvent = this.syncEventRepository.create({
      deviceId: device_id,
      timestamp: syncTimestamp,
      totalFilesSynced: total_files_synced,
      totalErrors: total_errors,
      internetSpeed: internet_speed,
      status,
      syncDurationMs: sync_duration_ms,
      metadata,
    });

    const savedEvent = await this.syncEventRepository.save(syncEvent);

    // Update device statistics
    await this.deviceService.updateDeviceStats(device_id, savedEvent);

    // Check for consecutive failures and trigger notifications
    if (status === SyncStatus.FAILED) {
      const device = await this.deviceService.findOne(device_id);
      if (device && device.consecutiveFailures >= 3) {
        await this.notificationService.handleRepeatedFailure(device);
      }
    }

    return savedEvent;
  }

  async getDeviceSyncHistory(
    deviceId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Check if device exists
    const device = await this.deviceService.findOne(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const [events, total] =
      await this.syncEventCustomRepository.findDeviceHistory(
        deviceId,
        page,
        limit,
      );

    const totalPages = Math.ceil(total / limit);

    return {
      deviceId,
      events,
      totalEvents: total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getDevicesWithRepeatedFailures(threshold: number = 3) {
    const devices =
      await this.syncEventCustomRepository.findDevicesWithRepeatedFailures(
        threshold,
      );

    return devices.map((device) => ({
      deviceId: device.deviceId,
      consecutiveFailures: device.consecutiveFailures,
      lastSyncAt: device.lastSyncAt,
      lastSuccessfulSyncAt: device.lastSuccessfulSyncAt,
      totalRecentFailures: device.totalFailedEvents,
    }));
  }

  async getDeviceStats(deviceId: string, days: number = 30) {
    const device = await this.deviceService.findOne(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const stats = await this.syncEventCustomRepository.getDeviceSyncStats(
      deviceId,
      days,
    );

    return {
      deviceId,
      period: `${days} days`,
      ...stats,
      successRate:
        stats.totalEvents > 0
          ? ((stats.successfulEvents / stats.totalEvents) * 100).toFixed(2)
          : 0,
    };
  }
}
