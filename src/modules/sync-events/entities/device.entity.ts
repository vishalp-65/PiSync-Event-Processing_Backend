import { SyncEvent } from 'src/modules/devices/entities/sync-event.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('devices')
@Index(['lastSyncAt'])
@Index(['consecutiveFailures'])
export class Device {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceModel?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  osVersion?: string;

  @Column({ type: 'int', default: 0 })
  totalSyncEvents: number;

  @Column({ type: 'int', default: 0 })
  totalSuccessfulSyncs: number;

  @Column({ type: 'int', default: 0 })
  totalFailedSyncs: number;

  @Column({ type: 'int', default: 0 })
  consecutiveFailures: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessfulSyncAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  avgInternetSpeed?: number;

  @Column({ type: 'bigint', default: 0 })
  totalFilesSynced: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SyncEvent, (syncEvent) => syncEvent.device, {
    cascade: true,
  })
  syncEvents: SyncEvent[];
}
