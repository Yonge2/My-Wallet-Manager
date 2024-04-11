import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Category } from '../database/entities/category.entity'
import { History } from 'src/database/entities/history.entity'

@Injectable()
export class StasticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 지난달 대비 이번달 소비 비율
   * @param anyStart YYYY-MM-DD
   * @param anyEnd  YYYY-MM-DD
   */
  async calMonthData(
    userId: number,
    month: {
      lastMonthStart: string
      lastMonthEnd: string
      thisMonthStart: string
      thisMonthEnd: string
    },
  ) {
    const { lastMonthStart, lastMonthEnd, thisMonthStart, thisMonthEnd } = month

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    const lastMonthData: { category: string; lastMonthSum: number }[] = await queryRunner.manager
      .createQueryBuilder(History, 'h')
      .select(['c.category AS category', 'SUM(h.amount) AS lastMonthSum'])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.user_id = :userId', { userId })
      .andWhere('h.created_at > :start', { start: lastMonthStart })
      .andWhere('h.created_at < :end', { end: lastMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getRawMany()

    const thisMonthData: { category: string; thisMonthSum: number }[] = await queryRunner.manager
      .createQueryBuilder(History, 'h')
      .select(['c.category AS category', 'SUM(h.amount) AS thisMonthSum'])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.user_id = :userId', { userId })
      .andWhere('h.created_at > :start', { start: thisMonthStart })
      .andWhere('h.created_at < :end', { end: thisMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getRawMany()

    await queryRunner.release()
    return {
      lastMonthData,
      thisMonthData,
    }
  }

  async calUsersData(
    userId: number,
    month: {
      lastMonthStart: string
      lastMonthEnd: string
      thisMonthStart: string
      thisMonthEnd: string
    },
  ) {
    const { lastMonthStart, lastMonthEnd, thisMonthStart, thisMonthEnd } = month

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    /**
     * SELECT c.category AS category, SUM(h.amount) AS sum,
     *        COUNT(h.amount) AS theNumberOfHistory, SUM(h.amount)/COUNT(h.amount) AS averageAmount
     *
     * FROM history h
     *   INNER JOIN category c ON h.category_id = c.id
     *
     * WHERE is_active = true
     *   AND h.created_at BETWEEN ${lastMonthStart} AND ${lastMonthEnd}
     *
     * GROUP BY c.id
     */
    const lastMonthData: { category: string; lastMonthSum: number }[] = await queryRunner.manager
      .createQueryBuilder(History, 'h')
      .select([
        'c.category AS category',
        'SUM(h.amount) AS sum',
        'COUNT(h.amount) AS theNumberOfHistory',
        'SUM(h.amount)/COUNT(h.amount) AS averageAmount',
      ])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.created_at > :start', { start: lastMonthStart })
      .andWhere('h.created_at < :end', { end: lastMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getRawMany()

    await queryRunner.release()
    return {
      lastMonthData,
    }
  }

  async calUsersData2(
    userId: number,
    month: {
      lastMonthStart: string
      lastMonthEnd: string
      thisMonthStart: string
      thisMonthEnd: string
    },
  ) {
    const { lastMonthStart, lastMonthEnd, thisMonthStart, thisMonthEnd } = month

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    /**
     * SELECT sb.category AS category, sb.sum AS sum,
     *        sb.count AS theNumberOfHistory, sb.sum/sb.count AS averageAmount
     *
     * FROM (SELECT c.category AS category, SUM(h.amount) AS sum, COUNT(h.amount) AS count
     *
     *       FROM history h
     *         INNER JOIN category c ON h.category_id = c.id
     *
     *       WHERE is_active = true
     *         AND h.created_at BETWEEN ${lastMonthStart} AND ${lastMonthEnd}
     *
     *       GROUP BY c.id) AS sb
     */
    const lastMonthData: { category: string; lastMonthSum: number }[] = await queryRunner.manager
      .createQueryBuilder()
      .from((subquery) => {
        return subquery
          .select(['c.category AS category', 'SUM(h.amount) AS sum', 'COUNT(h.amount) AS count'])
          .from(History, 'h')
          .innerJoin(Category, 'c', 'h.category_id = c.id')
          .where('h.created_at > :start', { start: lastMonthStart })
          .andWhere('h.created_at < :end', { end: lastMonthEnd })
          .andWhere('h.is_active=true')
          .groupBy('c.id')
      }, 'sb')
      .select([
        'sb.category AS category',
        'sb.sum AS sum',
        'sb.count AS theNumberOfHistory',
        'sb.sum/sb.count AS averageAmount',
      ])
      .getRawMany()

    await queryRunner.release()
    return {
      lastMonthData,
    }
  }

  //chunk, 누적 계산
  async calUserData3(month: {
    lastMonthStart: string
    lastMonthEnd: string
    thisMonthStart: string
    thisMonthEnd: string
  }) {
    const { lastMonthStart, lastMonthEnd, thisMonthStart, thisMonthEnd } = month

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    /**
     * SELECT sb.category AS category, sb.sum AS sum, sb.count AS theNumberOfHistory, sb.sum/sb.count AS averageAmount
     *
     * FROM (SELECT c.category, SUM(h.amount) AS sum, COUNT(h.amount) AS count
     *       FROM history h INNER JOIN category c ON h.category_id = c.id
     *       WHERE h.is_active = true
     *         AND h.created_at BETWEEN '2024-03-01' AND '2024-04-11'
     *         AND h.id > 0
     *       LIMIT 1000
     *       OFFSET 0
     * ) AS sb
     *
     * GROUP BY category
     * ORDER BY sb.id DESC;
     */
    const CHUNKED_NUM = 1000

    const chunkedQuery = async (historyId: number) => {
      return queryRunner.manager
        .createQueryBuilder()
        .select([
          'sb.category AS category',
          'sb.sum AS sum',
          'sb.count AS theNumberOfHistory',
          '(sb.sum/sb.count) AS averageAmount',
        ])
        .addFrom((subquery) => {
          return subquery
            .select(['c.category AS category', 'SUM(h.amount) AS sum', 'COUNT(h.amount) AS count'])
            .from(History, 'h')
            .innerJoin(Category, 'c', 'h.category_id = c.id')
            .where('h.is_active=true')
            .andWhere('h.created_at > :start', { start: lastMonthStart })
            .andWhere('h.created_at < :end', { end: lastMonthEnd })
            .andWhere('h.id > :historyId', { historyId: historyId })
            .groupBy('c.id')
            .offset(0)
            .limit(CHUNKED_NUM)
        }, 'sb')
        .orderBy('sb.category')
        .getRawMany()
    }

    const calledData = []
    let lastMonthData = []
    let historyId = 0

    do {
      const data = await chunkedQuery(historyId)
      if (data.length != 0) {
        historyId += CHUNKED_NUM
        calledData.push(data)
      }

      const chunkedData: usersMonthData[] = calledData.pop()

      if (lastMonthData.length === 0) {
        lastMonthData = chunkedData
        continue
      }

      lastMonthData = lastMonthData.map((preData: usersMonthData) => {
        for (let i = 0; i < chunkedData.length; i++) {
          const newData = chunkedData[i]
          if (preData.category != newData.category) {
            continue
          }
          preData.sum += newData.sum
          preData.theNumberOfHistory += newData.theNumberOfHistory
          preData.averageAmount = preData.sum / preData.theNumberOfHistory
          break
        }
        return lastMonthData
      })
    } while (calledData.length)

    return lastMonthData
  }
}

type usersMonthData = {
  category: string
  sum: number
  theNumberOfHistory: number
  averageAmount: number
}
