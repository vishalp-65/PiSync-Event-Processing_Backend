import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  SyncEvent,
  SyncStatus,
} from 'src/modules/devices/entities/sync-event.entity';

export interface SyncEventFilters {
  deviceId?: string;
  status?: SyncStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class SyncEventRepository extends Repository<SyncEvent> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(SyncEvent, dataSource.createEntityManager());
  }

  async findWithFilters(
    filters: SyncEventFilters,
  ): Promise<[SyncEvent[], number]> {
    const queryBuilder = this.createQueryBuilder(
      'sync_event',
    ).leftJoinAndSelect('sync_event.device', 'device');

    this.applyFilters(queryBuilder, filters);

    queryBuilder
      .orderBy('sync_event.timestamp', 'DESC')
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return queryBuilder.getManyAndCount();
  }

  async findDeviceHistory(
    deviceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<[SyncEvent[], number]> {
    const offset = (page - 1) * limit;

    return this.createQueryBuilder('sync_event')
      .where('sync_event.deviceId = :deviceId', { deviceId })
      .orderBy('sync_event.timestamp', 'DESC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();
  }

  async findDevicesWithRepeatedFailures(threshold: number = 3): Promise<any[]> {
    return this.dataSource.query(
      `
      SELECT 
        d.id as deviceId,
        d.consecutiveFailures,
        d.lastSyncAt,
        d.lastSuccessfulSyncAt,
        COUNT(se.id) as totalFailedEvents
      FROM devices d
      LEFT JOIN sync_events se ON d.id = se.deviceId 
        AND se.status = 'failed' 
        AND se.createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      WHERE d.consecutiveFailures >= ?
      GROUP BY d.id
      ORDER BY d.consecutiveFailures DESC, d.lastSyncAt ASC
    `,
      [threshold],
    );
  }

  async getDeviceSyncStats(deviceId: string, days: number = 30): Promise<any> {
    const result = await this.dataSource.query(
      `
      SELECT 
        COUNT(*) as totalEvents,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successfulEvents,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedEvents,
        AVG(internetSpeed) as avgInternetSpeed,
        AVG(syncDurationMs) as avgSyncDuration,
        SUM(totalFilesSynced) as totalFilesSynced
      FROM sync_events 
      WHERE deviceId = ? AND createdAt > DATE_SUB(NOW(), INTERVAL ? DAY)
    `,
      [deviceId, days],
    );

    return result[0];
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<SyncEvent>,
    filters: SyncEventFilters,
  ): void {
    if (filters.deviceId) {
      queryBuilder.andWhere('sync_event.deviceId = :deviceId', {
        deviceId: filters.deviceId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('sync_event.status = :status', {
        status: filters.status,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('sync_event.timestamp >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('sync_event.timestamp <= :endDate', {
        endDate: filters.endDate,
      });
    }
  }
}
