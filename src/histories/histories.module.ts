import { Module } from '@nestjs/common'
import { HistoriesService } from './histories.service'
import { HistoriesController } from './histories.controller'
import { BudgetsModule } from 'src/budgets/budgets.module'

@Module({
  imports: [BudgetsModule],
  controllers: [HistoriesController],
  providers: [HistoriesService],
})
export class HistoriesModule {}
