import { Injectable } from '@nestjs/common'
import { Budget } from '../database/entities/budget.entity'
import { DataSource } from 'typeorm'
import { BudgetCategory } from '../database/entities/budget-category.entity'

@Injectable()
export class BudgetsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async insertBudget(budget: Budget, budgetCategoryObj: { id: number; amount: number }[]) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      //insert Budget
      const insertBudgetJob = await queryRunner.manager.insert(Budget, budget)
      const budgetId = insertBudgetJob.generatedMaps[0].user_id

      //insert Budget-Category[]
      const budgetCategoryJobs = budgetCategoryObj.map(async (categoryBudget) => {
        const createBudgetCategory = {
          category: {
            id: categoryBudget.id,
          },
          budget: {
            user: { id: budgetId },
          },
          amount: categoryBudget.amount,
          ...new BudgetCategory(),
        }
        return await queryRunner.manager.insert(BudgetCategory, createBudgetCategory)
      })
      await Promise.all(budgetCategoryJobs)

      await queryRunner.commitTransaction()
      return true
    } catch (err) {
      console.log('insert Budget err : ', err)
      await queryRunner.rollbackTransaction()
      return false
    } finally {
      await queryRunner.release()
    }
  }

  async findMyBudget(userId: number): Promise<
    {
      totalAmount: number
      category: string
      amount: number
    }[]
  > {
    const query = `
    SELECT b.total_amount AS totalAmount, c.category, b_c.amount
    FROM budget b
      JOIN budget_category b_c
        ON b.id=b_c.budget_user_id
      JOIN category c
        ON b_c.category_id=c.id
    WHERE b.user_id=${userId}
      AND b.is_active=true
      AND b_c.is_active=true
    `
    return await this.dataSource.manager.query(query)
  }

  async updateBudget(userId: number, budget: Budget) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const isExistBudget = await queryRunner.manager
        .createQueryBuilder(Budget, 'budget')
        .where('budget.user_id = :userId', { userId })
        .getExists()

      if (!isExistBudget) {
        throw new Error('존재하지 않는 Budget')
      }

      const updateBudgetJob = await queryRunner.manager.update(Budget, { user: { id: userId } }, budget)
      if (!updateBudgetJob.affected) {
        throw new Error('변화된 값 없음')
      }

      await queryRunner.commitTransaction()
      return true
    } catch (err) {
      console.log('update budget err : ', err)
      await queryRunner.rollbackTransaction()
      return false
    } finally {
      await queryRunner.release()
    }
  }

  async updateBudgetCategory(updateBudgetCategories: Partial<BudgetCategory>[]) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const saveJobs = updateBudgetCategories.map(async (value) => {
        const saveResult = await queryRunner.manager.save(BudgetCategory, value)
        if (!saveResult.createdAt && !saveResult.updatedAt) {
          throw new Error('save transaction 실패')
        }
        return
      })
      await Promise.all(saveJobs)
      queryRunner.commitTransaction()
      return true
    } catch (err) {
      console.log('update budget-categroy err : ', err)
      await queryRunner.rollbackTransaction()
      return false
    } finally {
      await queryRunner.release()
    }
  }

  async calUserBudgets(): Promise<{ category: string; categoryPerTotal: number }[]> {
    return await this.dataSource.manager
      .createQueryBuilder(BudgetCategory, 'bc')
      .innerJoin('category', 'c', 'bc.category_id = c.id')
      .innerJoin('budget', 'b', 'bc.budget_user_id = b.user_id')
      .select(['c.category as category', 'SUM(bc.amount/b.total_amount)/COUNT(bc.budget_user_id) as categoryPerTotal'])
      .groupBy('c.id')
      .getRawMany()
  }
}
