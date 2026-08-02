import { Module } from '@nestjs/common';
import { TcpServer } from './tcp-server';
import { TrackerService } from './tracker.service';
import { TrackerDataModule } from 'src/tracker-data/tracker-data.module';

@Module({
  imports: [TrackerDataModule],
  providers: [TrackerService, TcpServer],
  exports: [TrackerService],
})
export class TrackerModule {}