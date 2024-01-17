import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetDto } from './dto/update-budget.dto'
import { Budget } from '../database/entities/budget.entity'
import { DataSource, Repository } from 'typeorm'
import { BudgetCategory } from '../database/entities/budget-category.entity'
import { UserInfo } from '../auth/get-user.decorator'
import { Category } from '../database/entities/category.entity'
import { User } from '../database/entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundError } from 'rxjs'

@Injectable()
export class BudgetsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 카테고리 유효성 검사 -> budget 생성 -> budget-category 생성
   * budget 생성시 필요한 것 : userid, total amount
   * budget-category 생성시 필요한 것 : budgetid, categoryid, amount
   */
  async createBudget(getUser: UserInfo, createBudgetDto: CreateBudgetDto) {
    const { totalAmount, ...budgetCategoryField } = createBudgetDto

    const budgetCategoryObj = await this.vaildateCategoryBudget(budgetCategoryField)

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

      budgetCategoryObj.forEach(async (category) => {
        const createBudgetCategory = {
          category: { id: category.id, ...new Category() },
          budget: { id: budgetId, ...new Budget() },
          amount: category.amount,
        }
        return await queryRunner.manager.getRepository(BudgetCategory).insert(createBudgetCategory)
      })

      await queryRunner.commitTransaction()
    } catch (err) {
      console.log('budget-category insert error: ', err)
      queryRunner.rollbackTransaction()
      throw new InternalServerErrorException('budget 생성 실패, 다시 시도해주세요.')
    } finally {
      await queryRunner.release()
      return { success: true }
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
    const { totalAmount, ...updateBudgetField } = updateBudgetDto

    const user = { id: getUser.id, name: getUser.name, ...new User() }
    const budget = { user: user, ...new Budget() }

    let updateBudgetResult: Budget | undefined
    let budgetId: number
    let updateBudgetCategoryResult: BudgetCategory[] = []

    if (totalAmount) {
      budget.total_budget = totalAmount
      updateBudgetResult = await this.dataSource.getRepository(Budget).save(budget)
      budgetId = updateBudgetResult.id
    }
    //여기 테스트할 것. 01-15
    if (!totalAmount) {
      const targetBudget = await this.dataSource.manager.getRepository(Budget).findOne({
        select: { id: true },
        where: { user: { id: getUser.id } },
      })
      budgetId = targetBudget.id
    }

    const budgetCategoryObj = await this.vaildateCategoryBudget(updateBudgetField)
    if (budgetCategoryObj.length) {
      budgetCategoryObj.forEach(async (category) => {
        const updateBudgetCategory = {
          category: { id: category.id, ...new Category() },
          budget: { id: budgetId, ...new Budget() },
          amount: category.amount,
        }
        updateBudgetCategoryResult.push(
          await this.dataSource.manager.getRepository(BudgetCategory).save(updateBudgetCategory),
        )
      })
    }

    console.log(updateBudgetCategoryResult)
    console.log(updateBudgetResult)

    if (!updateBudgetCategoryResult.length && !updateBudgetResult) {
      throw new BadRequestException('업데이트 실패, 다시 시도해주세요.')
    }

    return { success: true }
  }

  /**
   * 각 { 예산 카테고리 : 카테고리별 예산 } 검사 및 매칭
   */
  private async vaildateCategoryBudget(budgetCategoryField: { [category: string]: number }) {
    if (!budgetCategoryField) {
      return []
    }
    const categories = await this.dataSource.manager
      .getRepository(Category)
      .createQueryBuilder('category')
      .select(['category.id', 'category.category'])
      .where('category.is_active = true')
      .getMany()

    console.log(categories)

    //DB에 저장된 카테고리 배열
    const categoriesValue = categories.map((value: { id: number; category: string }) => {
      return value.category
    })

    const budgetCategoryObj = Object.keys(budgetCategoryField).map((key) => {
      const amount = Number(budgetCategoryField[`${key}`])
      const validCateogryIdx = categoriesValue.indexOf(key)

      if (validCateogryIdx === -1) throw new BadRequestException('사용할 수 없는 카테고리가 포함되어 있습니다.')

      return { id: categories[validCateogryIdx].id, amount: amount }
    })

    return budgetCategoryObj
  }
}
