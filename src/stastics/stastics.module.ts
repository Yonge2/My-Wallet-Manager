import { Module } from '@nestjs/common'
import { StasticsService } from './stastics.service'
import { StasticsController } from './stastics.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilsModule } from 'src/utils/utils.module'

@Module({
  imports: [TypeOrmModule.forFeature(), UtilsModule],
  controllers: [StasticsController],
  providers: [StasticsService],
})
export class StasticsModule {}
