import { Test, TestingModule } from '@nestjs/testing';
import { PatientInformService } from './patient-inform.service';

describe('PatientInformService', () => {
  let service: PatientInformService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientInformService],
    }).compile();

    service = module.get<PatientInformService>(PatientInformService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
