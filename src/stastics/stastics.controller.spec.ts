import { Test, TestingModule } from '@nestjs/testing';
import { StasticsController } from './stastics.controller';
import { StasticsService } from './stastics.service';

describe('StasticsController', () => {
  let controller: StasticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StasticsController],
      providers: [StasticsService],
    }).compile();

    controller = module.get<StasticsController>(StasticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
