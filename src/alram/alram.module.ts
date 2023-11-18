import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AlramService } from './alram.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/db/entity/user.entity'

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([User])],
  providers: [AlramService], // 아래에서 생성할 서비스
})
export class AlramModule {}
