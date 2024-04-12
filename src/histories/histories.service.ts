import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { HistoryDto } from './dto/create-history.dto'
import { UserInfo } from '../auth/get-user.decorator'
import { UtilCategoryService } from '../utils/utils.category.service'
import { User } from '../database/entities/user.entity'
import { Category } from '../database/entities/category.entity'
import { History } from '../database/entities/history.entity'
import { HistoriesRepository } from './histories.repository'

@Injectable()
export class HistoriesService {
  constructor(
    private budgetsUtil: UtilCategoryService,
    private readonly historiesRepository: HistoriesRepository,
  ) {}

  private pageOffset = (page: number) => 20 * (page - 1)

  /**
   * 지출내역 생성
   */
  async createHistory(getUser: UserInfo, createHistoryDto: HistoryDto) {
    const { memo, imageUrl, ...categoryAmountField } = createHistoryDto

    try {
      const categoryId2amount = await this.budgetsUtil.vaildateCategoryBudget(categoryAmountField)
      if (categoryId2amount.length != 1) {
        throw new HttpException('한 번에 하나의 지출내역을 생성할 수 있습니다.', HttpStatus.BAD_REQUEST)
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

      const historyInsertResult = await this.historiesRepository.insertHistory(history)
      if (!historyInsertResult) {
        throw new HttpException('지출내역 생성 실패', HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return {
        success: true,
      }
    } catch (err) {
      console.log('createHistory service err : ', err)
      throw new HttpException('지출내역 생성 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * 지출내역 목록 20개씩
   */
  async getHistories(getUser: UserInfo, page: number) {
    console.log(page)
    const offset = this.pageOffset(page)
    return await this.historiesRepository.findHistories(getUser.id, offset)
  }

  /**
   * 단일 지출내역
   */
  async getHistory(getUser: UserInfo, historyId: number) {
    return await this.historiesRepository.findHistory(getUser.id, historyId)
  }

  /**
   * 지출내역 수정
   */
  async updateHistory(getUser: UserInfo, historyId: number, updateHistoryDto: HistoryDto) {
    const { memo, imageUrl, ...categoryAmount } = updateHistoryDto
    let updateHistory = {}

    if (memo) {
      updateHistory['memo'] = memo
    }
    if (imageUrl) {
      updateHistory['imageUrl'] = imageUrl
    }
    if (Object.keys(categoryAmount).length) {
      const categoryId2amount = await this.budgetsUtil.vaildateCategoryBudget(categoryAmount)
      updateHistory['amount'] = categoryId2amount[0].amount
      updateHistory['category'] = { id: categoryId2amount[0].id, ...new Category() }
    }

    const updateResult = await this.historiesRepository.updateHistory(getUser.id, historyId, updateHistory)
    if (!updateResult) {
      throw new HttpException('변경 내역 없음. 다시 시도해주세요.', HttpStatus.BAD_REQUEST)
    }
    return {
      success: true,
    }
  }

  /**
   * 지출내역 삭제
   * soft delete 방법으로 삭제하기 때문에, updateHistroy 함수 재사용
   */
  async removeHistory(getUser: UserInfo, historyId: number) {
    const deleteHistory = { isActive: false }

    const deleteResult = await this.historiesRepository.updateHistory(getUser.id, historyId, deleteHistory)
    if (!deleteResult) {
      throw new HttpException('삭제 실패. 다시 시도해주세요.', HttpStatus.BAD_REQUEST)
    }
    return
  }
}
