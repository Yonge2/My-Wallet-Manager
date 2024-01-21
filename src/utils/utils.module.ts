import { Module } from '@nestjs/common'
import { RedisService } from './utils.redis.service'
import { UtilCategoryService } from './utils.category.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Budget } from 'src/database/entities/budget.entity'
import { User } from 'src/database/entities/user.entity'
import { Category } from 'src/database/entities/category.entity'
import { BudgetCategory } from 'src/database/entities/budget-category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Budget, User, Category, BudgetCategory])],
  exports: [RedisService, UtilCategoryService],
})
export class UtilsModule {}
