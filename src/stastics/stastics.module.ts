import { Module } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { StasticsController } from './stastics.controller'
import { StasticsRepository } from './stastics.repository'
import { UtilDayjsService } from 'src/utils/utils.dayjs.service'
import { UtilsModule } from 'src/utils/utils.module'

@Module({
  imports: [UtilsModule],
  controllers: [StasticsController],
  providers: [StasticsService, StasticsRepository, UtilDayjsService],
})
export class StasticsModule {}
