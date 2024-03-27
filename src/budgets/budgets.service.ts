import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetCategoryDto, UpdateBudgetDto } from './dto/update-budget.dto'
import { Budget } from '../database/entities/budget.entity'
import { BudgetCategory } from '../database/entities/budget-category.entity'
import { UserInfo } from '../auth/get-user.decorator'
import { User } from '../database/entities/user.entity'
import { UtilCategoryService } from '../utils/utils.category.service'
import { BudgetsRepository } from './budget.repository'
import { RedisService } from '../utils/utils.redis.service'

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetsRepository: BudgetsRepository,
    private readonly budgetsUtil: UtilCategoryService,
    private readonly redisService: RedisService,
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

    const createBudgetResult = await this.budgetsRepository.insertBudget(budget, budgetCategoryObj)
    if (!createBudgetResult) {
      throw new HttpException('예산 생성 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
    }
  }

  async getMyBudget(getUser: UserInfo) {
    const rawMyBudget = await this.budgetsRepository.findMyBudget(getUser.id)
    if (!rawMyBudget.length) {
      return {
        message: '등록된 예산이 없습니다. 예산을 등록하세요.',
      }
    }
    const myBudget = {}

    const organizeRawBudget = rawMyBudget.map(async (raw) => {
      myBudget['totalAmount'] = raw.totalAmount
      myBudget[`${raw.category}`] = raw.amount
      return
    })
    await Promise.all(organizeRawBudget)

    return myBudget
  }

  async updateBudget(getUser: UserInfo, updateBudgetDto: UpdateBudgetDto) {
    const updateBudgetObj = {
      ...updateBudgetDto,
      ...new Budget(),
    }
    const updateBudgetResult = await this.budgetsRepository.updateBudget(getUser.id, updateBudgetObj)
    if (!updateBudgetResult) {
      throw new HttpException('예산 수정 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
    }
  }

  async updateBudgetCategory(getUser: UserInfo, updateBudgetCategory: UpdateBudgetCategoryDto) {
    //필터링 된 {category-id: amount}[]
    const budgetCategoryObj = await this.budgetsUtil.vaildateCategoryBudget(updateBudgetCategory)
    const updateBudgetCategorySets = budgetCategoryObj.map((budgetCategory) => {
      return {
        budget: {
          user: { id: getUser.id },
        },
        category: {
          id: budgetCategory.id,
        },
        amount: budgetCategory.amount,
        ...new BudgetCategory(),
      }
    })

    const updateBudgetCategoryResult = await this.budgetsRepository.updateBudgetCategory(updateBudgetCategorySets)
    if (!updateBudgetCategoryResult) {
      throw new HttpException('업데이트 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
    }
  }

  /**
   * 사용자들의 설정 예산 평균 데이터
   */
  async usersBudgetAverage() {
    //cache 확인
    const cachedUsersBudget = await this.redisService.usersBudgetGet()
    if (cachedUsersBudget) {
      return cachedUsersBudget
    }

    const usersBudget = await this.budgetsRepository.calUserBudgets()
    if (!usersBudget.length) {
      return {
        message: '아직 등록된 데이터가 없습니다.',
      }
    }

    const categoryAverage: { [key: string]: number } = {}

    //백분율로 변환 및 객체로 변환
    usersBudget.forEach((ele) => {
      categoryAverage[`${ele.category}`] = Math.round(Number(ele.categoryPerTotal) * 100)
    })
    //caching
    const categoryAverageByString = JSON.stringify(categoryAverage)
    const redisSetJob = await this.redisService.usersBudgetSet(categoryAverageByString)

    return categoryAverage
  }
}
