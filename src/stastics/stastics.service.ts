import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as dayjs from 'dayjs'
import { JwtUserInfo } from 'src/authorization/jwt.dto'
import { WalletHistory } from 'src/db/entity/wallet-history.entity'
import redisClient from 'src/utils/redis'
import { Repository } from 'typeorm'

const REDIS_STASTICS_MONTH = (userId) => `STASTICS_MONTH_${userId}`
const REDIS_STASTICS_WEEK = (userId) => `STASTICS_WEEK_${userId}`
const REDIS_STASTICS_USER = `STASTICS_USER`

@Injectable()
export class StasticsService {
  constructor(
    @InjectRepository(WalletHistory)
    private walletHistoryRepo: Repository<WalletHistory>,
  ) {}

  /**
   오늘까지 소비 총액 / 지난 달의 오늘까지 소비 총액
   */
  byMonth = async (user: JwtUserInfo) => {
    const userId = user.id
    const redisKey = REDIS_STASTICS_MONTH(userId)
    try {
      let lastMonthPaid = await redisClient.get(redisKey)

      const { thisMonthStart, thisMonthEnd, lastMonthStart, lastMonthEnd } = dayjsObject()

      if (!lastMonthPaid) {
        const preData = await this.walletHistoryRepo.query(
          `SELECT SUM(amount) as lastMonSum FROM wallet_history
          WHERE createdAt > '${lastMonthStart}' AND createdAt < '${lastMonthEnd}' AND user_id = ${userId}`,
        )

        if (!preData[0].lastMonSum) return { data: '지난 데이터가 없네요' }

        lastMonthPaid = preData[0].lastMonSum
        await redisClient.set(redisKey, lastMonthPaid)
      }

      const nowData = await this.walletHistoryRepo.query(
        `SELECT SUM(amount) as thisMonSum FROM wallet_history
        WHERE createdAt > '${thisMonthStart}' AND createdAt < '${thisMonthEnd}' AND user_id = ${userId}`,
      )

      const thisMonthPaid = nowData[0].thisMonSum ? nowData[0].thisMonSum : 0
      const myDataPerOthers = Math.round((parseFloat(thisMonthPaid) / parseFloat(lastMonthPaid)) * 100)

      return { data: myDataPerOthers }
    } catch (e) {
      console.log(e)
      throw new HttpException('데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND)
    }
  }

  /**
   오늘 예산 사용 / 여태까지의 해당요일 예산 사용 평균
   */
  byWeek = async (user: JwtUserInfo) => {
    const userId = user.id
    const redisKey = REDIS_STASTICS_WEEK(userId)
    const { standardDate } = dayjsObject()

    try {
      let dayAVG = await redisClient.get(redisKey)

      if (!dayAVG) {
        const preData = await this.walletHistoryRepo.query(
          `SELECT AVG(day.sum) as dayAVG 
          FROM (SELECT SUM(amount) AS sum FROM wallet_history
          WHERE createdAt < '${standardDate}' AND DAYOFWEEK(createdAt) = DAYOFWEEK(NOW()) AND user_id=${userId}) AS day;`,
        )

        if (!preData[0].dayAVG) return { data: '지난 데이터가 없네요' }

        dayAVG = preData[0].dayAVG
        await redisClient.set(redisKey, dayAVG)
      }

      const todayData = await this.walletHistoryRepo.query(
        `SELECT SUM(amount) AS today
      FROM wallet_history WHERE createdAt > '${standardDate}' AND user_id=${userId};`,
      )

      const todayPaid = todayData[0].today ? todayData[0].today : 0

      const todayPerPre = Math.round((parseInt(todayPaid) / parseInt(dayAVG)) * 100)

      return { data: todayPerPre }
    } catch (e) {
      console.log('byWeeks error : ', e)
      throw new HttpException('데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND)
    }
  }

  /**
  (*이번달) 나의 예산 사용 비율 / 다른 유저 예산 사용 비율 평균 * 100
   */
  byUser = async (user: JwtUserInfo) => {
    const userId = user.id
    const redisKey = REDIS_STASTICS_USER

    const { startDate, endDate } = dayjsObject()

    try {
      let otherUserData = await redisClient.get(redisKey)

      if (!otherUserData) {
        const data = await this.walletHistoryRepo.query(
          `SELECT AVG(users.per) as otherUsersAVG 
       FROM (SELECT SUM(h.amount)/s.total_amount AS per
       FROM set_budget s JOIN wallet_history h ON s.user_id=h.user_id
        WHERE h.createdAt > '${startDate}' AND h.createdAt < '${endDate}' GROUP BY h.user_id) AS users;`,
        )

        //전체 유저 데이터 캐싱
        otherUserData = data[0].otherUsersAVG
        await redisClient.set(redisKey, otherUserData)
      }

      const myData = await this.walletHistoryRepo.query(
        `SELECT SUM(h.amount)/s.total_amount AS per
      FROM wallet_history h JOIN set_budget s ON h.user_id=s.user_id
      WHERE h.createdAt > '${startDate}' AND h.createdAt < '${endDate}' AND h.user_id=${userId};
    `,
      )

      const myDataPerOthers = Math.round((parseFloat(myData[0].per) / parseFloat(otherUserData)) * 100)

      return { data: myDataPerOthers }
    } catch (e) {
      throw new HttpException('데이터를 찾을 수 없습니다.', HttpStatus.NOT_FOUND)
    }
  }
}

const dayjsObject = () => {
  const todayForStandard = dayjs().add(1, 'day')
  const todayForDay = dayjs()

  const subtractDay = todayForStandard.get('date')
  const thisMonthDays = todayForDay.get('date')

  return {
    thisMonthEnd: todayForStandard.format('YYYY-MM-DD'),
    thisMonthStart: todayForDay.subtract(subtractDay, 'd').format('YYYY-MM-DD'),
    lastMonthStart: dayjs()
      .set('month', todayForStandard.get('month') - 1)
      .set('date', 0)
      .format('YYYY-MM-DD'),
    lastMonthEnd: dayjs()
      .set('month', todayForStandard.get('month') - 1)
      .format('YYYY-MM-DD'),

    startDate: todayForDay.subtract(thisMonthDays, 'd').format('YYYY-MM-DD'),
    endDate: todayForDay.format('YYYY-MM-DD'),

    standardDate: dayjs().subtract(1, 'd').format('YYYY-MM-DD'),
  }
}
