import { Injectable, NotFoundException } from '@nestjs/common'
import { BudgetCategory } from 'src/database/entities/budget-category.entity'
import { RedisService } from 'src/utils/utils.redis.service'
import { DataSource } from 'typeorm'

@Injectable()
export class BudgetsRecommendService {
  constructor(
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  /**
   * 사용자들의 설정 예산 평균 데이터
   */
  async usersBudgetAverage() {
    //cache 확인
    const cachedUsersBudget = await this.redisService.usersBudgetGet()
    if (cachedUsersBudget) {
      return cachedUsersBudget
    }

    const usersBudget = await this.dataSource
      .createQueryBuilder(BudgetCategory, 'bc')
      .innerJoin('category', 'c', 'bc.category_id = c.id')
      .innerJoin('budget', 'b', 'bc.budget_id = b.id')
      .select(['c.category as category', 'SUM(bc.amount/b.total_budget)/COUNT(*) as categoryPerTotal'])
      .groupBy('c.id')
      .getRawMany()

    if (!usersBudget) {
      throw new NotFoundException('아직 등록한 사용자가 없습니다.')
    }

    const categoryAverage: { [key: string]: number } = {}

    //백분율로 변환 및 객체로 변환
    usersBudget.forEach((ele) => {
      categoryAverage[`${ele.category}`] = Math.round(Number(ele.categoryPerTotal) * 100)
    })

    //caching
    const categoryAverageByString = JSON.stringify(categoryAverage)
    await this.redisService.usersBudgetSet(categoryAverageByString)

    return categoryAverage
  }
}
