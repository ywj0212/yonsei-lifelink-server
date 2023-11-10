import { Test, TestingModule } from '@nestjs/testing';
import { PatientInformController } from './patient-inform.controller';

describe('PatientInformController', () => {
  let controller: PatientInformController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientInformController],
    }).compile();

    controller = module.get<PatientInformController>(PatientInformController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
