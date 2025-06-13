import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'src/modules/sync-events/entities/device.entity';
import { Repository } from 'typeorm';
import { SyncEvent, SyncStatus } from '../entities/sync-event.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async findOne(deviceId: string): Promise<Device | null> {
    return this.deviceRepository.findOne({ where: { id: deviceId } });
  }

  async findOrCreate(deviceId: string): Promise<Device> {
    let device = await this.findOne(deviceId);

    if (!device) {
      device = this.deviceRepository.create({
        id: deviceId,
        isActive: true,
      });
      await this.deviceRepository.save(device);
    }

    return device;
  }

  async updateDeviceStats(
    deviceId: string,
    syncEvent: SyncEvent,
  ): Promise<void> {
    const device = await this.findOrCreate(deviceId);

    // Update basic counters
    device.totalSyncEvents += 1;
    device.lastSyncAt = syncEvent.timestamp;
    device.totalFilesSynced += syncEvent.totalFilesSynced;

    // Update success/failure counters
    if (syncEvent.status === SyncStatus.SUCCESS) {
      device.totalSuccessfulSyncs += 1;
      device.lastSuccessfulSyncAt = syncEvent.timestamp;
      device.consecutiveFailures = 0; // Reset consecutive failures
    } else if (syncEvent.status === SyncStatus.FAILED) {
      device.totalFailedSyncs += 1;
      device.consecutiveFailures += 1;
    } else {
      // Partial success - count as success but don't reset consecutive failures
      device.totalSuccessfulSyncs += 1;
      device.lastSuccessfulSyncAt = syncEvent.timestamp;
    }

    // Update average internet speed
    if (syncEvent.internetSpeed) {
      if (device.avgInternetSpeed) {
        device.avgInternetSpeed =
          (device.avgInternetSpeed + syncEvent.internetSpeed) / 2;
      } else {
        device.avgInternetSpeed = syncEvent.internetSpeed;
      }
    }

    await this.deviceRepository.save(device);
  }

  async getActiveDevices(): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { isActive: true },
      order: { lastSyncAt: 'DESC' },
    });
  }

  async getDevicesWithHighFailureRate(
    threshold: number = 0.5,
  ): Promise<Device[]> {
    return this.deviceRepository
      .createQueryBuilder('device')
      .where('device.totalSyncEvents > 10')
      .andWhere(
        '(device.totalFailedSyncs / device.totalSyncEvents) >= :threshold',
        { threshold },
      )
      .orderBy('(device.totalFailedSyncs / device.totalSyncEvents)', 'DESC')
      .getMany();
  }
}
