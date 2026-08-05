import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';

@Module({
  imports: [],
  providers: [VehiclesService],
  controllers: [VehiclesController],
  exports: [VehiclesService]
})
export class VehiclesModule {}
