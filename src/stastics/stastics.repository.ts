import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Category } from '../database/entities/category.entity'

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
      .select(['c.category', 'SUM(h.amount) AS lastMonthSum'])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.user_id = :userId', { userId })
      .andWhere('h.created_at > :start', { lastMonthStart })
      .andWhere('h.created_at < :end', { lastMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getRawMany()

    const thisMonthData: { category: string; thisMonthSum: number }[] = await queryRunner.manager
      .createQueryBuilder(History, 'h')
      .select(['c.category AS category', 'SUM(h.amount) AS thisMonthSum'])
      .innerJoin(Category, 'c', 'h.category_id = c.id')
      .where('h.user_id = :userId', { userId })
      .andWhere('h.created_at > :start', { thisMonthStart })
      .andWhere('h.created_at < :end', { thisMonthEnd })
      .andWhere('h.is_active=true')
      .groupBy('c.id')
      .getRawOne()

    await queryRunner.release()
    return {
      lastMonthData,
      thisMonthData,
    }
  }
}
