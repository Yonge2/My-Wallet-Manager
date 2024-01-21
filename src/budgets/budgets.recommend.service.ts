import { Injectable, NotFoundException } from '@nestjs/common'
import { BudgetCategory } from 'src/database/entities/budget-category.entity'
import redisClient from 'src/utils/redis'
import { DataSource } from 'typeorm'

@Injectable()
export class BudgetsRecommendService {
  constructor(private dataSource: DataSource) {}

  private RECOMMENDATION_KEY = 'STATISTICS:USER_BUDGET'
  private REDIIS_EX_12H = 60 * 60 * 12

  /**
   * 사용자들의 설정 예산 평균 데이터
   */
  async usersBudgetAverage() {
    const usersBudgetInRedis = await redisClient.get(this.RECOMMENDATION_KEY)
    console.log(usersBudgetInRedis)

    let categoryAverage: { [key: string]: number } = {}

    if (usersBudgetInRedis) {
      /** redis hset 고민 -> data가 많지 않기 때문에,
       *json.stringfy(저장) <-> json.parse (parseInt) (사용) 사용하기로 결정
       */
      categoryAverage = JSON.parse(usersBudgetInRedis)
      Object.entries(categoryAverage).forEach(([category, average]) => {
        categoryAverage[`${category}`] = Number(average)
      })

      return categoryAverage
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

    //백분율로 변환 및 객체로 변환
    usersBudget.forEach((ele) => {
      categoryAverage[`${ele.category}`] = Math.round(Number(ele.categoryPerTotal) * 100)
    })

    //캐싱 및 12H 마다 삭제 (데이터 최신화 및 캐싱 관리)
    await redisClient.set(this.RECOMMENDATION_KEY, JSON.stringify(categoryAverage), {
      EX: this.REDIIS_EX_12H,
    })

    return categoryAverage
  }
}
