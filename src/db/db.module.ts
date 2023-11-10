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
      username: '',
      password: '',
      database: '',
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
