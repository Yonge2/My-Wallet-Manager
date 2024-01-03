import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import jwtAuthorization from './authorization/jwtAuthorization'
import { BudgetsModule } from './budgets/budgets.module'
import { BudgetsController } from './budgets/budgets.controller'
import { PaysModule } from './pays/pays.module'
import { PaysController } from './pays/pays.controller'
import { AlramModule } from './alram/alram.module'
import { StasticsModule } from './stastics/stastics.module'
import { StasticsController } from './stastics/stastics.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: process.env.MODE === 'production' ? '.production.env' : '.development.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => await typeOrmConfig(configService),
    }),
    ScheduleModule.forRoot(),
    AlramModule,
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
