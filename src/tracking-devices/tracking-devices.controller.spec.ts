import { Test, TestingModule } from '@nestjs/testing';
import { TrackingDevicesController } from './tracking-devices.controller';

describe('TrackingDevicesController', () => {
  let controller: TrackingDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingDevicesController],
    }).compile();

    controller = module.get<TrackingDevicesController>(TrackingDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
