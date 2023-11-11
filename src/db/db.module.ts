import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { BudgetCategory } from './entity/budget-category'
import { SetBudget } from './entity/set-budget.entity'
import { User } from './entity/user.entity'
import { WalletHistory } from './entity/wallet-history.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USER || 'mywallet',
      password: process.env.DB_PW || '123a',
      database: process.env.DB_NAME || 'mywallet_db',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      entities: [BudgetCategory, SetBudget, User, WalletHistory],
    }),
  ],
  controllers: [],
  providers: [],
})
export class DbModule {}
