import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { DbModule } from './db/db.module'
import { ConfigModule } from '@nestjs/config'
import jwtAuthorization from './authorization/jwtAuthorization'
import { UserController } from './user/user.controller'

@Module({
  imports: [UserModule, DbModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})

// 미들웨어 작창 방법 예시
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(jwtAuthorization)
      .exclude({ path: '/user/signup', method: RequestMethod.POST })
      .forRoutes(UserController)
  }
}
