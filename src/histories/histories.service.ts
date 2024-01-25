import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateHistoryDto } from './dto/create-history.dto'
import { UpdateHistoryDto } from './dto/update-history.dto'
import { DataSource } from 'typeorm'
import { UserInfo } from 'src/auth/get-user.decorator'
import { UtilCategoryService } from '../utils/utils.category.service'
import { User } from 'src/database/entities/user.entity'
import { Category } from 'src/database/entities/category.entity'
import { History } from 'src/database/entities/history.entity'

@Injectable()
export class HistoriesService {
  constructor(
    private dataSource: DataSource,
    private budgetsUtil: UtilCategoryService,
  ) {}

  private pageOffset = (page: number) => 20 * (page - 1)
  private GET_LIMIT = 20

  async createHistory(getUser: UserInfo, createHistoryDto: CreateHistoryDto) {
    const { memo, imageUrl, ...categoryAmountField } = createHistoryDto

    const categoryId2amount = await this.budgetsUtil.vaildateCategoryBudget(categoryAmountField)
    if (categoryId2amount.length != 1) {
      throw new BadRequestException('한 번에 하나의 Wallet-History를 생성할 수 있습니다.')
    }

    const user = { id: getUser.id, ...new User() }
    const category = { id: categoryId2amount[0].id, ...new Category() }
    const history = {
      user: user,
      category: category,
      amount: categoryId2amount[0].amount,
      memo: createHistoryDto.memo,
      imageUrl: createHistoryDto.imageUrl,
      ...new History(),
    }

    const historyResult = await this.dataSource.getRepository(History).insert(history)

    return historyResult
  }

  async getHistories(getUser: UserInfo, page: number) {
    const offset = this.pageOffset(page)

    const histories = await this.dataSource
      .createQueryBuilder(History, 'h')
      .innerJoin('h.category', 'c', 'h.category_id = c.id')
      .select(['h.id', 'c.category', 'h.amount', 'h.created_at'])
      .where('user_id = :userId', { userId: getUser.id })
      .andWhere('h.is_active = true')
      .limit(this.GET_LIMIT)
      .offset(offset)
      .getMany()

    if (!histories.length) {
      throw new NotFoundException('등록된 내역이 없습니다.')
    }

    return histories
  }

  async getHistory(getUser: UserInfo, id: number) {
    const history = await this.dataSource
      .createQueryBuilder(History, 'h')
      .innerJoin('category', 'c', 'h.category_id = c.id')
      .select([
        'h.id as id',
        'c.category as category',
        'h.amount as amount',
        'h.memo as memo',
        'h.image_url',
        'h.created_at',
      ])
      .where('h.user_id = :userId', { userId: getUser.id })
      .andWhere('h.id = :historyId', { historyId: id })
      .andWhere('h.is_active = true')
      .getRawOne()

    if (!history) {
      throw new NotFoundException('등록된 내역이 없습니다.')
    }
    return history
  }

  async updateHistory(getUser: UserInfo, id: number, updateHistoryDto: UpdateHistoryDto) {
    let updateHistory = new History()

    const historyId = await this.dataSource.manager.findOne(History, {
      select: { id: true },
      where: { id: id, user: { id: getUser.id }, isActive: true },
    })

    if (!historyId) {
      throw new NotFoundException('등록된 내역이 없습니다.')
    }

    const { imageUrl, memo, ...categoryAmount } = updateHistoryDto
    updateHistory = {
      id: historyId.id,
      memo: memo,
      imageUrl: imageUrl,
      ...updateHistory,
    }

    if (categoryAmount) {
      const categoryId2amount = await this.budgetsUtil.vaildateCategoryBudget(categoryAmount)
      updateHistory.amount = categoryId2amount[0].amount
      updateHistory.category = { id: categoryId2amount[0].id, ...new Category() }
    }

    const updateResult = await this.dataSource.manager.save(History, updateHistory)
    if (!updateResult.updatedAt) {
      throw new BadRequestException('변경 내역 없음. 다시 시도해주세요.')
    }

    return updateResult
  }

  async deleteHistory(getUser: UserInfo, id: number) {
    const historyId = await this.dataSource.manager.findOne(History, {
      select: { id: true },
      where: { id: id, user: { id: getUser.id }, isActive: true },
    })
    if (!historyId) {
      throw new NotFoundException('등록된 내역이 없습니다.')
    }

    const deleteHistory = { id: historyId.id, isActive: false, ...new History() }

    const deleteResult = await this.dataSource.manager.save(History, deleteHistory)
    if (!deleteResult.updatedAt) {
      throw new BadRequestException('변경 내역 없음. 다시 시도해주세요.')
    }

    return { success: true }
  }
}
