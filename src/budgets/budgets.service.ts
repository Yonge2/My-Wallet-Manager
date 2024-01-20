import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetCategoryDto, UpdateBudgetDto } from './dto/update-budget.dto'
import { Budget } from '../database/entities/budget.entity'
import { DataSource } from 'typeorm'
import { BudgetCategory } from '../database/entities/budget-category.entity'
import { UserInfo } from '../auth/get-user.decorator'
import { Category } from '../database/entities/category.entity'
import { User } from '../database/entities/user.entity'
import { BudgetsUtil } from './budgets.util'

@Injectable()
export class BudgetsService {
  constructor(
    private dataSource: DataSource,
    private budgetsUtil: BudgetsUtil,
  ) {}

  /**
   * 카테고리 유효성 검사 -> budget 생성 -> budget-category 생성
   * budget 생성시 필요한 것 : userid, total amount
   * budget-category 생성시 필요한 것 : budgetid, categoryid, amount
   */
  async createBudget(getUser: UserInfo, createBudgetDto: CreateBudgetDto) {
    const { totalAmount, ...budgetCategoryField } = createBudgetDto

    const budgetCategoryObj = await this.budgetsUtil.vaildateCategoryBudget(budgetCategoryField)

    const user = { id: getUser.id, name: getUser.name, ...new User() }
    const budget = { user: user, total_budget: totalAmount, ...new Budget() }

    //transaction
    //budget 생성 -> budget-category table 생성
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      const createBudget = await queryRunner.manager.getRepository(Budget).insert(budget)
      const budgetId = createBudget.generatedMaps[0].id

      const budgetCategoryPromises = budgetCategoryObj.map(async (category) => {
        const createBudgetCategory = {
          category: { id: category.id, ...new Category() },
          budget: { id: budgetId, ...new Budget() },
          amount: category.amount,
        }
        return queryRunner.manager.getRepository(BudgetCategory).insert(createBudgetCategory)
      })
      await Promise.all(budgetCategoryPromises)

      await queryRunner.commitTransaction()

      return { success: true }
    } catch (err) {
      console.log('budget-category insert error: ', err)
      queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  async getBudget(getUser: UserInfo) {
    const budget = await this.dataSource.getRepository(Budget).findOne({
      select: { id: true, total_budget: true },
      where: { isActive: true, user: { id: getUser.id, isActive: true } },
    })

    if (!budget) {
      throw new NotFoundException('설정한 예산이 없습니다.')
    }

    const category2amount = await this.dataSource
      .getRepository(BudgetCategory)
      .createQueryBuilder('bc')
      .select(['c.category', 'bc.amount'])
      .innerJoin('bc.category', 'c')
      .where('bc.budget_id = :budgetId', { budgetId: budget.id })
      .andWhere('bc.is_active=true')
      .andWhere('c.is_active=true')
      .getMany()

    category2amount.forEach((ele) => {
      const key = ele.category.category
      const value = ele.amount
      budget[`${key}`] = value
    })

    const { id, ...budgets } = budget

    return budgets
  }

  async updateBudget(getUser: UserInfo, updateBudgetDto: UpdateBudgetDto) {
    const totalAmount = updateBudgetDto.totalAmount

    const budgetId = await this.dataSource.manager.getRepository(Budget).findOne({
      select: { id: true },
      where: { user: { id: getUser.id }, isActive: true },
    })

    const user = { id: getUser.id, name: getUser.name, ...new User() }
    //total_budget 변수명 수정하기
    const budget = { id: budgetId.id, user, total_budget: totalAmount, ...new Budget() }

    const updateBudgetResult = await this.dataSource.getRepository(Budget).save(budget)
    if (updateBudgetResult.total_budget != totalAmount) {
      throw new BadRequestException('업데이트 실패, 변경 값 없음.')
    }
    return { success: true }
  }

  async updateBudgetCategory(getUser: UserInfo, updateBudgetCategory: UpdateBudgetCategoryDto) {
    //필터링 된 {category-id: amount}[]
    const category2amount = await this.budgetsUtil.vaildateCategoryBudget(updateBudgetCategory)

    // { budget-category-id, category-id }[]
    const originBudgetCategory = await this.dataSource.getRepository(BudgetCategory).find({
      select: { id: true, category: { id: true } },
      relations: ['budget', 'category'],
      where: { budget: { user: { id: getUser.id } }, isActive: true },
    })

    //update budget 객체들
    const updateBudgets = category2amount.map(async (ele) => {
      const budgetCategory = new BudgetCategory()
      budgetCategory.amount = ele.amount

      //업데이트 대상 id 매칭
      originBudgetCategory.forEach((originBudget) => {
        if (ele.id === originBudget.category.id) {
          budgetCategory.id = originBudget.id
        }
      })
      //새로 추가되는 경우
      if (!budgetCategory.id) {
        const budgetId = await this.dataSource.getRepository(Budget).findOne({
          select: { id: true },
          where: { user: { id: getUser.id }, isActive: true },
        })
        budgetCategory.category = { id: ele.id, ...new Category() }
        budgetCategory.budget = { id: budgetId.id, ...new Budget() }
      }
      return budgetCategory
    })

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const updatePromises = updateBudgets.map(async (budget) => {
        const updateResult = await queryRunner.manager.save(await budget)
        if (!updateResult.updatedAt) {
          throw new BadRequestException('업데이트 실패. 변경사항 없음.')
        }
      })
      await Promise.all(updatePromises)

      await queryRunner.commitTransaction()

      return { success: true }
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }
}
