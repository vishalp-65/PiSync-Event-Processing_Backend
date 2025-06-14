import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  IsJSON,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSyncEventDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  device_id: string;

  @ApiProperty({ description: 'Timestamp in ISO format' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Total number of files synced' })
  @IsInt()
  total_files_synced: number;

  @ApiProperty({ description: 'Total number of errors during sync' })
  @IsInt()
  total_errors: number;

  @ApiProperty({ description: 'Internet speed in Mbps', required: false })
  @IsOptional()
  @IsNumber()
  internet_speed?: number;

  @ApiProperty({
    description: 'Sync duration in milliseconds',
    required: false,
  })
  @IsOptional()
  @IsInt()
  sync_duration_ms?: number;

  @ApiProperty({ description: 'Additional metadata as JSON', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
