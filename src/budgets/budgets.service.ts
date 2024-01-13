import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetDto } from './dto/update-budget.dto'
import { Budget } from 'src/database/entities/budget.entity'
import { DataSource, Repository } from 'typeorm'
import { BudgetCategory } from 'src/database/entities/budget-category.entity'
import { UserInfo } from 'src/auth/get-user.decorator'
import { Category } from 'src/database/entities/category.entity'
import { User } from 'src/database/entities/user.entity'

@Injectable()
export class BudgetsService {
  constructor(private dataSource: DataSource) {}

  private readonly categoryRepository = this.dataSource.manager.getRepository(Category)
  private readonly budgetRepository = this.dataSource.manager.getRepository(Budget)
  private readonly budgetCategoryRepository = this.dataSource.manager.getRepository(BudgetCategory)

  /**
   * 카테고리 유효성 검사 -> budget 생성 -> budget-category 생성
   * budget 생성시 필요한 것 : userid, total amount
   * budget-category 생성시 필요한 것 : budgetid, categoryid, amount
   */
  async createBudget(getUser: UserInfo, createBudgetDto: CreateBudgetDto) {
    const categories: { id: number; category: string }[] = await this.categoryRepository
      .createQueryBuilder()
      .select(['id', 'category'])
      .where('category.is_active = :active', { active: true })
      .getRawMany()

    //DB에 저장된 카테고리 배열
    const categoriesValue = categories.map((value: { id: number; category: string }) => {
      return value.category
    })

    const { totalAmount, ...budgetCategoryField } = createBudgetDto

    //DB에 저장된 카테고리와 client가 저장하길 원하는 카테고리가 유효한지 비교
    const budgetCategoryObj = Object.keys(budgetCategoryField).map((key) => {
      const amount = Number(budgetCategoryField[`${key}`])
      const validCateogryIdx = categoriesValue.indexOf(key)

      if (validCateogryIdx === -1) throw new BadRequestException('사용할 수 없는 카테고리가 포함되어 있습니다.')

      return { id: categories[validCateogryIdx].id, amount: amount }
    })

    const user = { id: getUser.id, name: getUser.name, ...new User() }
    const budget = { user: user, total_budget: totalAmount, ...new Budget() }

    //transaction
    //budget 생성 -> budget-category table 생성
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      const createBudget = await this.budgetRepository.insert(budget)
      const budgetId = createBudget.generatedMaps[0].id

      budgetCategoryObj.forEach(async (category) => {
        const createBudgetCategory = {
          category: { id: category.id, ...new Category() },
          budget: { id: budgetId, ...new Budget() },
          amount: category.amount,
        }
        return await this.budgetCategoryRepository.insert(createBudgetCategory)
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

  findAll() {
    return `This action returns all budgets`
  }

  findOne(id: number) {
    return `This action returns a #${id} budget`
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`
  }

  remove(id: number) {
    return `This action removes a #${id} budget`
  }
}
