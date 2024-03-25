import { Module } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { BudgetsController } from './budgets.controller'
import { UtilsModule } from 'src/utils/utils.module'
import { BudgetsRepository } from './budget.repository'

@Module({
  imports: [UtilsModule],
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetsRepository],
})
export class BudgetsModule {}
