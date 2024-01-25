import { Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'

@Injectable()
export class UtilDayjsService {
  /**
   * SQL 조건식에 활용 (문자열 비교를 통한 날짜 계산)
   * ex) '저번달의 시작' < createdAt AND '저번달의 오늘' > createdAt
   */

  month() {
    const today = dayjs()
    const lastMonth = today.subtract(1, 'month')
    //(-2)월(31or30)일
    const lastMonthStart = lastMonth.date(0).format('YYYY-MM-DD')
    //(-1)월(현재+1)일
    const lastMonthEnd = lastMonth.add(1, 'day').format('YYYY-MM-DD')
    const thisMonthStart = today.date(0).format('YYYY-MM-DD')
    const thisMonthEnd = today.add(1, 'day').format('YYYY-MM-DD')
    return {
      lastMonthStart,
      lastMonthEnd,
      thisMonthStart,
      thisMonthEnd,
    }
  }

  week() {
    const today = dayjs()
    const lastWeek = today.subtract(1, 'week')
    const lastWeekStart = lastWeek.subtract(1, 'day').format('YYYY-MM-DD')
    const lastWeekEnd = lastWeek.add(1, 'day').format('YYYY-MM-DD')
    return {
      lastWeekStart,
      lastWeekEnd,
    }
  }

  day() {
    const today = dayjs()
    const todayStart = today.subtract(1, 'day').format('YYYY-MM-DD')
    const todayEnd = today.add(1, 'day').format('YYYY-MM-DD')
    return {
      todayStart,
      todayEnd,
    }
  }
}
