import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateBudgetDto, PostBudgetDto, UpdateBudgetDto, UpdatePostBudgetDto } from './dto/create-budget.dto'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { Category } from './entities/budget.entity'
import { SetBudget } from 'src/db/entity/set-budget.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import redisClient from 'src/utils/redis'

const BUDGET_REDIS_KEY = 'budgetCache'

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(SetBudget)
    private setBudgetRepo: Repository<SetBudget>,
  ) {}

  /**
   물리적으로 선언해놓은 키 반환
   */
  getCategory() {
    return Category
  }

  /**
   예산 설정 : 예산 설정 요청 -> 저장 -> 캐싱 
   */
  createBudget = async (user: JwtUserInfo, postBudgetDto: PostBudgetDto) => {
    const { totalAmount: _totalAmount, ...budgetField } = postBudgetDto
    const budget = new CreateBudgetDto()
    budget.user_id = user.id
    budget.total_amount = postBudgetDto.totalAmount
    budget.budget_field = budgetField

    try {
      const budgetInsert = await this.setBudgetRepo.insert(budget)
      //유저 평균 값을 내기 위한 캐싱
      await budgetCacheForRecommend(budget)

      return budgetInsert
    } catch (e) {
      console.log('budget insert error', e)
      throw new HttpException('요청확인 후 다시 시도하세요', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   예산 수정 : 본인 데이터만 수정 가능
   */
  updateBudget = async (user: JwtUserInfo, postBudgetDto: UpdatePostBudgetDto) => {
    const { totalAmount: _totalAmount, ...budgetField } = postBudgetDto

    let updateSet: UpdateBudgetDto = {}
    if (postBudgetDto.totalAmount) updateSet.total_amount = postBudgetDto.totalAmount
    if (budgetField) updateSet.budget_field = budgetField

    try {
      const budgetInsert = await this.setBudgetRepo.update(user.id, updateSet)
      return
    } catch (e) {
      console.log('budget update error', e)
      throw new HttpException('요청확인 후 다시 시도하세요', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   예산 설계 추천 : 예산 설정해놓은 캐싱 데이터 -> 반환
   */
  recommendBudget = async () => {
    const recommend = await redisClient.get(BUDGET_REDIS_KEY)
    if (!recommend) return { message: '데이터가 없네요' }
    return JSON.parse(recommend)
  }
}

const budgetCacheForRecommend = async ({ total_amount, budget_field }: CreateBudgetDto) => {
  //{weight: 3, budget : {cate1: 0.3, cate2: 0.2, cate3: 0.4, ...}}
  const preData = await redisClient.get(BUDGET_REDIS_KEY)
  if (!preData) {
    let data = { weight: 1 }

    Object.entries(budget_field).forEach((value) => {
      const key = value[0]
      const val = value[1]
      data = { ...data, [key]: Math.round((val / total_amount) * 100) }
    })
    const result = await redisClient.set(BUDGET_REDIS_KEY, JSON.stringify(data))
    return
  }

  let data = JSON.parse(preData)
  data.weight += 1

  Object.entries(budget_field).forEach((value) => {
    const key = value[0]
    const val = value[1]
    data[key] = Math.round(((data.weight - 1) * data[key] + Math.round((val / total_amount) * 100)) / data.weight)
  })

  await redisClient.set(BUDGET_REDIS_KEY, JSON.stringify(data))
  return
}
