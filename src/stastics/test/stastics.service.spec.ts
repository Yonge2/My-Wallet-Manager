import { Test, TestingModule } from '@nestjs/testing'
import { StasticsService } from '../stastics.service'

describe('StasticsService', () => {
  let service: StasticsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StasticsService],
    }).compile()

    service = module.get<StasticsService>(StasticsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
