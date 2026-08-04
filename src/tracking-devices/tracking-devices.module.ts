import { Module } from '@nestjs/common';
import { TrackingDevicesService } from './tracking-devices.service';
import { TrackingDevicesController } from './tracking-devices.controller';

@Module({
  providers: [TrackingDevicesService],
  controllers: [TrackingDevicesController]
})
export class TrackingDevicesModule {}
