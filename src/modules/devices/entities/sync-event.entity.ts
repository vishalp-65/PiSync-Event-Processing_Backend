import { Device } from 'src/modules/sync-events/entities/device.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum SyncStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

@Entity('sync_events')
@Index(['deviceId', 'createdAt'])
@Index(['status', 'createdAt'])
@Index('idx_sync_events_device_timestamp', ['deviceId', 'timestamp'])
export class SyncEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  deviceId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'bigint', default: 0 })
  totalFilesSynced: number;

  @Column({ type: 'int', default: 0 })
  totalErrors: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  internetSpeed?: number;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.SUCCESS,
  })
  status: SyncStatus;

  @Column({ type: 'int', nullable: true })
  syncDurationMs?: number;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Device, (device) => device.syncEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deviceId' })
  device: Device;
}
