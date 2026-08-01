import { Module } from '@nestjs/common';
import { TcpServer } from './tcp-server';
import { TrackerService } from './tracker.service';

@Module({
  providers: [TrackerService, TcpServer],
  exports: [TrackerService],
})
export class TrackerModule {}