import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncEventController } from './sync-event.controller';
import { SyncEventService } from './services/sync-event.service';
import { SyncEventRepository } from './repositories/sync-event.repository';
import { SyncEvent } from '../devices/entities/sync-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncEvent])],
  controllers: [SyncEventController],
  providers: [SyncEventService, SyncEventRepository],
  exports: [SyncEventService],
})
export class SyncEventModule {}
