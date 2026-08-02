import { Module } from '@nestjs/common';
import { TrackerDataController } from './tracker-data.controller';
import { TrackerDataService } from './tracker-data.service';

@Module({
    controllers: [TrackerDataController],
    providers: [TrackerDataService],
    exports: [TrackerDataService]

})
export class TrackerDataModule {}
