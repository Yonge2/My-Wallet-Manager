import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { UserModule } from './auth/user.module'
import { CategoriesModule } from './categories/categories.module'
import { BudgetsModule } from './budgets/budgets.module';
import { HistoriesModule } from './histories/histories.module';
import { StasticsModule } from './stastics/stastics.module';

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
    UserModule,
    CategoriesModule,
    BudgetsModule,
    HistoriesModule,
    StasticsModule,
  ],
})
export class AppModule {}
