import { Test, TestingModule } from '@nestjs/testing';
import { TrackingDevicesService } from './tracking-devices.service';

describe('TrackingDevicesService', () => {
  let service: TrackingDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingDevicesService],
    }).compile();

    service = module.get<TrackingDevicesService>(TrackingDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
