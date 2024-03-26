import { Module } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { StasticsController } from './stastics.controller'
import { StasticsRepository } from './stastics.repository'

@Module({
  controllers: [StasticsController],
  providers: [StasticsService, StasticsRepository],
})
export class StasticsModule {}
