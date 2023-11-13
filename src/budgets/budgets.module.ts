import { Module } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { BudgetsController } from './budgets.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SetBudget } from 'src/db/entity/set-budget.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SetBudget])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
