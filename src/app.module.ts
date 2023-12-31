import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { DbModule } from './db/db.module'
import { ConfigModule } from '@nestjs/config'
import jwtAuthorization from './authorization/jwtAuthorization'
import { BudgetsModule } from './budgets/budgets.module'
import { BudgetsController } from './budgets/budgets.controller'
import { PaysModule } from './pays/pays.module'
import { PaysController } from './pays/pays.controller'
import { AlramModule } from './alram/alram.module'
import { StasticsModule } from './stastics/stastics.module'
import { StasticsController } from './stastics/stastics.controller'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AlramModule,
    DbModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    BudgetsModule,
    PaysModule,
    StasticsModule,
  ],
})

//미들웨어 작창 방법 예시
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthorization).forRoutes(BudgetsController, PaysController, StasticsController)
  }
}
