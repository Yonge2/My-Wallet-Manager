import { Module } from '@nestjs/common'
import { HistoriesService } from './histories.service'
import { HistoriesController } from './histories.controller'
import { BudgetsModule } from 'src/budgets/budgets.module'
import { UtilsModule } from 'src/utils/utils.module'

@Module({
  imports: [BudgetsModule, UtilsModule],
  controllers: [HistoriesController],
  providers: [HistoriesService],
})
export class HistoriesModule {}
