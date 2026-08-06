import { Module } from '@nestjs/common';
import { TrackerServer } from './tracker.server';
import { TrackerService } from './tracker.service';
import { TrackerDataModule } from 'src/tracker-data/tracker-data.module';

@Module({
  imports: [TrackerDataModule],
  providers: [TrackerService, TrackerServer],
  exports: [TrackerService],
})
export class TrackerModule {}