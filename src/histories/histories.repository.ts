import { Injectable } from '@nestjs/common'
import { History } from '../database/entities/history.entity'
import { DataSource } from 'typeorm'

@Injectable()
export class HistoriesRepository {
  constructor(private readonly dataSource: DataSource) {}

  private GET_LIMIT = 20

  async insertHistory(history: History) {
    try {
      await this.dataSource.manager.insert(History, history)
      return true
    } catch (err) {
      console.log('insert history err : ', err)
      return false
    }
  }

  async findHistories(
    userId: number,
    offset: number,
  ): Promise<{ id: number; category: string; amount: number; date: string }[]> {
    return await this.dataSource.manager
      .createQueryBuilder(History, 'h')
      .innerJoin('h.category', 'c', 'h.category_id = c.id')
      .select(['h.id', 'c.category', 'h.amount', `DATE_FORMAT(h.created_at, '%m-%d %H:%i') AS date`])
      .where('user_id = :userId', { userId })
      .andWhere('h.is_active = true')
      .limit(this.GET_LIMIT)
      .offset(offset)
      .getRawMany()
  }

  async findHistory(
    userId: number,
    historyId: number,
  ): Promise<{
    id: number
    category: string
    amount: number
    memo: string | null
    imageUrl: string | null
    date: string
  }> {
    return await this.dataSource.manager
      .createQueryBuilder(History, 'h')
      .innerJoin('category', 'c', 'h.category_id = c.id')
      .select([
        'h.id AS id',
        'c.category AS category',
        'h.amount AS amount',
        'h.memo AS memo',
        'h.image_url AS imageUrl',
        `DATE_FORMAT(h.created_at, '%m-%d %H:%i') AS date`,
      ])
      .where('h.user_id = :userId', { userId })
      .andWhere('h.id = :historyId', { historyId })
      .andWhere('h.is_active = true')
      .getRawOne()
  }

  async updateHistory(userId: number, historyId: number, history: Partial<History>) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      const isExistId = await queryRunner.manager
        .createQueryBuilder(History, 'history')
        .where('history.id = :historyId', { historyId: history.id })
        .andWhere('history.user_id = userId', { userId })
        .getExists()

      if (!isExistId) {
        throw new Error('존재하지 않는 history Id')
      }
      const updateHistoryJob = await queryRunner.manager.update(History, { id: historyId }, history)
      if (!updateHistoryJob.affected) {
        throw new Error('변화된 값 없음')
      }

      await queryRunner.commitTransaction()
      return true
    } catch (err) {
      console.log('update history err : ', err)
      await queryRunner.rollbackTransaction()
      return false
    } finally {
      await queryRunner.release()
    }
  }
}
