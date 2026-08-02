import { Test, TestingModule } from '@nestjs/testing';
import { TrackerDataController } from './tracker-data.controller';

describe('TrackerDataController', () => {
  let controller: TrackerDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackerDataController],
    }).compile();

    controller = module.get<TrackerDataController>(TrackerDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
