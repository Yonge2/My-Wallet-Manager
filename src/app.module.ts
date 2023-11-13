import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { DbModule } from './db/db.module'
import { ConfigModule } from '@nestjs/config'
import jwtAuthorization from './authorization/jwtAuthorization'
import { BudgetsModule } from './budgets/budgets.module'
import { BudgetsController } from './budgets/budgets.controller'

@Module({
  imports: [UserModule, DbModule, ConfigModule.forRoot({ isGlobal: true }), BudgetsModule],
})

// 미들웨어 작창 방법 예시
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jwtAuthorization).forRoutes(BudgetsController)
  }
}
