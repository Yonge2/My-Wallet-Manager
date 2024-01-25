import { Injectable } from '@nestjs/common'
import { UserInfo } from 'src/auth/get-user.decorator'
import { Category } from 'src/database/entities/category.entity'
import { History } from 'src/database/entities/history.entity'
import { UtilDayjsService } from 'src/utils/utils.dayjs.service'
import { DataSource } from 'typeorm'

@Injectable()
export class StasticsService {
  constructor(
    private dataSource: DataSource,
    private utilDayjs: UtilDayjsService,
  ) {}

  async byMonth(getUser: UserInfo) {
    // const cachedMonthData = true|false
    // if(cachedMonthData){
    //   return
    // }
    const month = this.utilDayjs.month()

    //방법 1. 커넥션 2번, 분자 / 분모
    const lastMonthData = await this.dataSource
      .createQueryBuilder(History, 'h')
      .select(['c.category', 'SUM(h.amount) AS lastMonthSum'])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.user_id = :userId', { userId: getUser.id })
      .andWhere('h.created_at > :start', { start: month.lastMonthStart })
      .andWhere('h.created_at < :end', { end: month.lastMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getMany()

    const thisMonthData = await this.dataSource
      .createQueryBuilder(History, 'h')
      .select(['c.category', 'SUM(h.amount) AS thisMonthSum'])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.user_id = :userId', { userId: getUser.id })
      .andWhere('h.created_at > :start', { start: month.thisMonthStart })
      .andWhere('h.created_at < :end', { end: month.thisMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getMany()

    console.log(lastMonthData)
    console.log(thisMonthData)
    //방법 2. subquery를 통한 분자 분모 get, 한 번의 커넥션
    // const monthData = await this.dataSource
    //   .createQueryBuilder(History, 'h')
    //   .select(['c.category', 'SUM(h.amount) AS lastMonthSum'])
    //방법 3. 조건에 맞는 전체를 그냥 get, 레디스를 이용하던지 하는 방법

    return
  }

  byDay(getUser: UserInfo) {
    return
  }

  byUsers(getUser: UserInfo) {
    return
  }
}
