import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserInfo } from '../auth/get-user.decorator'
import { UtilDayjsService } from '../utils/utils.dayjs.service'
import { StasticsRepository } from './stastics.repository'

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

      case 'users':
        return await this.userStastics3(getUser.id)

      default:
        return
    }

    //방법 1. SUM연산, COUNT연산, SUM연산/COUNT연산 (average) -> 집계함수 총 4번
    //방법 2. subQuery 활용 : SUN연산, COUNT 연산, sum/count (서브쿼리에서 연산된 것 단순 나누기) -> 집계함수 총 2번
    //방법 3. data Chunk : 방법 2를 기반, 데이터 1,000개씩 잘라서 조회 및 연산 후 코드 단에서 누적 합계

    // 4/11 테스트 결과 : 천개, 만개, 10만개에서는 차이가 없음.
  }
  private async userStastics1(userId) {
    const month = this.utilDayjs.month()
    console.log('통계 100,000개 데이터 시작')
    console.time('MySQL Connection + calculation time')
    const lastMonthData = await this.stasticsRepository.calUsersData(userId, month)
    console.timeEnd('MySQL Connection + calculation time')
    return lastMonthData
  }

  private async userStastics2(userId) {
    const month = this.utilDayjs.month()
    console.log('통계 100,000개 데이터 시작')
    console.time('MySQL Connection + calculation time')
    const lastMonthData = await this.stasticsRepository.calUsersData2(userId, month)
    console.timeEnd('MySQL Connection + calculation time')
    return lastMonthData
  }

  private async userStastics3(userId) {
    const month = this.utilDayjs.month()
    console.log('통계 100,000개 데이터 시작')
    console.time('MySQL Connection + calculation time')
    const lastMonthData = await this.stasticsRepository.calUserData3(month)
    console.timeEnd('MySQL Connection + calculation time')
    return lastMonthData
  }
}
