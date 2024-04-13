import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Category } from '../database/entities/category.entity'
import { History } from 'src/database/entities/history.entity'
import { idText } from 'typescript'

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
    const data: usersMonthData[] = await queryRunner.manager
      .createQueryBuilder(History, 'h')
      .select([
        'c.category AS category',
        'SUM(h.amount) AS sum',
        'COUNT(h.amount) AS theNumberOfHistory',
        'SUM(h.amount)/COUNT(h.amount) AS averageAmount',
      ])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.created_at > :start', { start: '2023-01-01' })
      .andWhere('h.created_at < :end', { end: '2024-01-01' })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .orderBy('c.id')
      .getRawMany()

    await queryRunner.release()
    const lastMonthData = data.map((v) => {
      v.averageAmount = Number(v.averageAmount)
      v.sum = Number(v.sum)
      v.theNumberOfHistory = Number(v.theNumberOfHistory)
      return v
    })
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
    const data: usersMonthData[] = await queryRunner.manager
      .createQueryBuilder()
      .select([
        'sb.category AS category',
        'sb.sum AS sum',
        'sb.count AS theNumberOfHistory',
        'sb.sum/sb.count AS averageAmount',
      ])
      .from((subquery) => {
        return subquery
          .select(['c.category AS category', 'SUM(h.amount) AS sum', 'COUNT(h.amount) AS count'])
          .from(History, 'h')
          .innerJoin(Category, 'c', 'h.category_id = c.id')
          .where('h.created_at > :start', { start: '2023-01-01' })
          .andWhere('h.created_at < :end', { end: '2024-02-01' })
          .andWhere('h.is_active=true')
          .groupBy('c.id')
      }, 'sb')
      .orderBy('sb.category')
      .getRawMany()

    await queryRunner.release()

    const lastMonthData = data.map((v) => {
      v.averageAmount = Number(v.averageAmount)
      v.sum = Number(v.sum)
      v.theNumberOfHistory = Number(v.theNumberOfHistory)
      return v
    })

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
    const CHUNKED_SIZE = 5000

    const chunkedQuery = async (historyId: number) => {
      if (historyId === -1) {
        return []
      }
      return queryRunner.manager
        .createQueryBuilder()
        .select(['sb.category AS category', 'SUM(sb.amount) AS sum', 'COUNT(sb.amount) AS theNumberOfHistory'])
        .addSelect((qb) => {
          return qb
            .select('ids.id AS id')
            .from((qb2) => {
              return qb2
                .select('h.id AS id')
                .from(History, 'h')
                .where('h.is_active=true')
                .andWhere('h.created_at > :start', { start: '2023-01-01' })
                .andWhere('h.created_at < :end', { end: '2024-02-01' })
                .andWhere('h.id > :historyId', { historyId })
                .orderBy('h.id', 'ASC')
                .limit(CHUNKED_SIZE)
                .offset(0)
            }, 'ids')
            .orderBy('ids.id', 'DESC')
            .limit(1)
        }, 'lastOne')
        .from((qb) => {
          return qb
            .select(['c.category AS category', 'h.amount AS amount'])
            .from(History, 'h')
            .innerJoin(Category, 'c', 'h.category_id = c.id')
            .where('h.is_active=true')
            .andWhere('h.created_at > :start', { start: '2023-01-01' })
            .andWhere('h.created_at < :end', { end: '2024-02-01' })
            .andWhere('h.id > :historyId', { historyId })
            .limit(CHUNKED_SIZE)
            .offset(0)
        }, 'sb')
        .groupBy('sb.category')
        .orderBy('sb.category')
        .getRawMany<usersMonthData>()
    }

    let chunkedData = []
    let lastMonthData = []
    const ldata = {
      교통비: {
        sum: 0,
        theNumberOfAmount: 0,
        averageOfAmount: 0,
      },
      주거비: {
        sum: 0,
        theNumberOfAmount: 0,
        averageOfAmount: 0,
      },
      유흥비: {
        sum: 0,
        theNumberOfAmount: 0,
        averageOfAmount: 0,
      },
      자기계발비: {
        sum: 0,
        theNumberOfAmount: 0,
        averageOfAmount: 0,
      },
      식비: {
        sum: 0,
        theNumberOfAmount: 0,
        averageOfAmount: 0,
      },
      기타: {
        sum: 0,
        theNumberOfAmount: 0,
        averageOfAmount: 0,
      },
    }
    let historyId = 0

    const chunking = async (historyId: number) => {
      return await queryRunner.manager
        .createQueryBuilder()
        .select(['c.category AS category', 'h.amount AS amount', 'h.id AS id'])
        .from(History, 'h')
        .innerJoin(Category, 'c', 'c.id = h.category_id')
        .where('h.is_active=true')
        .andWhere('h.created_at > :start', { start: '2023-01-01' })
        .andWhere('h.created_at < :end', { end: '2024-02-01' })
        .andWhere('h.id > :historyId', { historyId })
        .orderBy('h.id', 'ASC')
        .limit(CHUNKED_SIZE)
        .offset(0)
        .getRawMany()
    }

    do {
      // console.log(historyId)
      console.time('데이터 time')
      chunkedData = await chunking(historyId)
      // console.log(chunkedData)
      // historyId = chunkedData[0] ? chunkedData[0].lastOne : -1
      console.timeEnd('데이터 time')

      // if (lastMonthData.length === 0) {
      //   lastMonthData = chunkedData
      //   continue
      // }
      // console.time('데이터 처리 time')
      // lastMonthData = lastMonthData.map((preData: usersMonthData) => {
      //   for (let i = 0; i < chunkedData.length; i++) {
      //     const newData = chunkedData[i]
      //     if (preData.category != newData.category) {
      //       continue
      //     }
      //     preData.sum = Number(preData.sum) + Number(newData.sum)
      //     preData.theNumberOfHistory = Number(preData.theNumberOfHistory) + Number(newData.theNumberOfHistory)
      //     preData.averageAmount = preData.sum / preData.theNumberOfHistory
      //     break
      //   }
      //   return preData
      // })
      // console.timeEnd('데이터 처리 time')
      console.time('데이터 처리 time')
      chunkedData.forEach((v: { category: string; amount: number; id: number }) => {
        const category = v.category
        ldata[`${category}`]['sum'] += v.amount
        ldata[`${category}`]['theNumberOfAmount'] += 1
        ldata[`${category}`]['averageOfAmount'] =
          ldata[`${category}`]['sum'] / ldata[`${category}`]['theNumberOfAmount']
      })
      console.timeEnd('데이터 처리 time')
      historyId = chunkedData.length ? chunkedData.at(-1).id : -1
    } while (chunkedData.length)

    return ldata
  }
}

type usersMonthData = {
  category: string
  sum: number
  theNumberOfHistory: number
  averageAmount?: number
}

// SELECT sb.category AS category, SUM(sb.amount) AS sum, COUNT(sb.amount) AS theNumberOfHistory
// FROM (SELECT c.category, h.amount AS amount
//       FROM history h INNER JOIN category c ON h.category_id = c.id
//       WHERE h.is_active = true
//         AND h.created_at BETWEEN '2024-01-01' AND '2024-02-01'
//       ORDER BY h.id
//       LIMIT 100
//       OFFSET 0
//       ) AS sb
// GROUP BY category
// ORDER BY category;

// SELECT c.category, h.amount AS amount, h.id
// FROM history h INNER JOIN category c ON h.category_id = c.id
// WHERE h.is_active = true
//   AND h.created_at BETWEEN '2024-01-01' AND '2024-02-01'
// ORDER BY h.id
// LIMIT 15
// OFFSET 0

// SELECT sb.id
// FROM (SELECT h.id
//   FROM history h INNER JOIN category c ON h.category_id = c.id
//   WHERE h.is_active = true
//     AND h.created_at BETWEEN '2024-01-01' AND '2024-02-01'
//     AND h.id > 100106
//   ORDER BY h.id
//   LIMIT 10
//   OFFSET 0) AS sb
// ORDER BY sb.id DESC
// LIMIT 1;

// const getLastHistoryId = async (historyId: number) => {
//   return await queryRunner.manager.query(`
//   SELECT sb.id AS lastHistoryId
//   FROM (SELECT h.id
//         FROM history h INNER JOIN category c ON h.category_id = c.id
//         WHERE h.is_active = true
//         AND h.created_at BETWEEN '2023-01-01' AND '2024-01-01'
//         AND h.id > ${historyId}
//         ORDER BY h.id
//         LIMIT ${CHUNKED_SIZE}
//         OFFSET 0) AS sb
//   ORDER BY sb.id DESC
//   LIMIT 1;
//   `)
// }

// const chunkedRawQuery = async (historyId: number) => {
//   if (historyId === -1) {
//     return []
//   }
//   return await queryRunner.manager.query(`
//   SELECT sb.category AS category, SUM(sb.amount) AS sum, COUNT(sb.id) AS theNumberOfHistory
//   FROM (SELECT c.category, h.amount AS amount
//         FROM history h INNER JOIN category c ON h.category_id = c.id
//         WHERE h.is_active = true
//           AND h.created_at BETWEEN '2023-01-01' AND '2024-01-01'
//           AND h.id > ${historyId}
//         ORDER BY h.id
//         LIMIT 1000
//         OFFSET 0
//         ) AS sb
//   GROUP BY category
//   ORDER BY category;
//   `)
// }
