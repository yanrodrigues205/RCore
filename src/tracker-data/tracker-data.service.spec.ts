import { Test, TestingModule } from '@nestjs/testing';
import { TrackerDataService } from './tracker-data.service';

describe('TrackerDataService', () => {
  let service: TrackerDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackerDataService],
    }).compile();

    service = module.get<TrackerDataService>(TrackerDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
