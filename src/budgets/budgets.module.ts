import { Module } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { BudgetsController } from './budgets.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Budget } from '../database/entities/budget.entity'
import { User } from '../database/entities/user.entity'
import { Category } from '../database/entities/category.entity'
import { BudgetCategory } from '../database/entities/budget-category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Budget, User, Category, BudgetCategory])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
