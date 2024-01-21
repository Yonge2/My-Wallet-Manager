import { Injectable } from '@nestjs/common'
import redisClient from './redis'

@Injectable()
export class RedisService {
  private readonly RECOMMENDATION_KEY = 'STATISTICS:USER_BUDGET'
  private readonly REDIIS_EX_12H = 60 * 60 * 12

  async usersBudgetGet() {
    const usersBudgetInRedis = await redisClient.get(this.RECOMMENDATION_KEY)
    if (!usersBudgetInRedis) {
      return false
    }
    /** redis hset 고민 -> data가 많지 않기 때문에,
     *json.stringfy(저장) <-> json.parse (parseInt) (사용) 사용하기로 결정
     */
    const categoryAverage = JSON.parse(usersBudgetInRedis)
    Object.entries(categoryAverage).forEach(([category, average]) => {
      categoryAverage[`${category}`] = Number(average)
    })

    return categoryAverage
  }

  //캐싱 및 12H 마다 삭제 (데이터 최신화 및 캐싱 관리)
  async usersBudgetSet(data: string) {
    return await redisClient.set(this.RECOMMENDATION_KEY, JSON.stringify(data), {
      EX: this.REDIIS_EX_12H,
    })
  }
}
