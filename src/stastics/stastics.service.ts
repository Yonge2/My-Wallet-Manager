import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserInfo } from '../auth/get-user.decorator'
import { UtilDayjsService } from '../utils/utils.dayjs.service'
import { StasticsRepository } from './stastics.repository'

//여기부터 시작하면 됨.
@Injectable()
export class StasticsService {
  constructor(
    private readonly stasticsRepository: StasticsRepository,
    private readonly utilDayjs: UtilDayjsService,
  ) {}

  async paidStastics(getUser: UserInfo, method: string) {
    switch (method) {
      case 'month':
        const month = this.utilDayjs.month()
        const { lastMonthData, thisMonthData } = await this.stasticsRepository.calMonthData(getUser.id, month)
        if (!lastMonthData && !thisMonthData) {
          throw new HttpException('통계 조회 불가', HttpStatus.NOT_FOUND)
        }

        const monthData = lastMonthData.map((lastMonth) => {
          const data = {
            category: lastMonth.category,
            thisMonthPerLastMonth: 0,
          }
          for (let i = 0; i < thisMonthData.length; i++) {
            const category = thisMonthData[i].category
            if (category === lastMonth.category) {
              data.thisMonthPerLastMonth = (thisMonthData[i].thisMonthSum / lastMonth.lastMonthSum) * 100
              break
            }
            continue
          }
          return data
        })

        return monthData

      case 'day':
        return

      case 'user':
        return

      default:
        return
    }

    //방법 1. 커넥션 2번, 분자 / 분모
    //방법 2. subquery를 통한 분자 분모 get, 한 번의 커넥션
    // const monthData = await this.dataSource
    //   .createQueryBuilder(History, 'h')
    //   .select(['c.category', 'SUM(h.amount) AS lastMonthSum'])
    //방법 3. 조건에 맞는 전체를 그냥 get, 레디스를 이용하던지 하는 방법
  }
}
