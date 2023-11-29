import { Module } from '@nestjs/common'
import { BePayService, PaidService } from './alram.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/db/entity/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [BePayService, PaidService], // 아래에서 생성할 서비스
})
export class AlramModule {}
