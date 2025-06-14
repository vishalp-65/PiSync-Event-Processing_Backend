import { ApiProperty } from '@nestjs/swagger';
import { SyncStatus } from 'src/modules/devices/entities/sync-event.entity';

export class SyncEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  totalFilesSynced: number;

  @ApiProperty()
  totalErrors: number;

  @ApiProperty({ enum: SyncStatus })
  status: SyncStatus;

  @ApiProperty({ required: false })
  internetSpeed?: number;

  @ApiProperty({ required: false })
  syncDurationMs?: number;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;
}

export class SyncHistoryResponseDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty({ type: [SyncEventResponseDto] })
  events: SyncEventResponseDto[];

  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}
