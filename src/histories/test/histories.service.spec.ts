import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { HttpStatus } from '@nestjs/common'
import { UserInfo } from '../../auth/get-user.decorator'
import { HistoriesService } from '../histories.service'
import { HistoriesRepository } from '../histories.repository'
import { HistoryDto } from '../dto/create-history.dto'
import { UtilCategoryService } from '../../utils/utils.category.service'

describe('histories-Service', () => {
  const mockHistoriesRepository = () => ({
    insertHistory: jest.fn(),
    findHistories: jest.fn(),
    findHistory: jest.fn(),
    updateHistory: jest.fn(),
    removeHistory: jest.fn(),
  })

  const mockUitlService = () => ({
    vaildateCategoryBudget: jest.fn(),
  })

  let historiesService: HistoriesService
  let historiesRepository: HistoriesRepository
  let historyUtil: UtilCategoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoriesService,
        {
          provide: HistoriesRepository,
          useValue: mockHistoriesRepository(),
        },
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
        {
          provide: UtilCategoryService,
          useValue: mockUitlService(),
        },
      ],
    }).compile()

    historiesRepository = module.get<HistoriesRepository>(HistoriesRepository)
    historiesService = module.get<HistoriesService>(HistoriesService)
    historyUtil = module.get<UtilCategoryService>(UtilCategoryService)
  })

  /**
   * create-history service test values
   * 가정 : category_id : 1, category: 주거비
   */
  const testUserInfo: UserInfo = { id: 1, name: 'test', isManager: true }
  const createHistoryDto: HistoryDto = { 주거비: '5000', imageUrl: 'test', memo: 'test' }
  const testCategoryId2amountValue = [{ id: 1, amount: 5000 }]
  const testInsertResultToSuccess = true
  const testInsertResultToFail = false
  const testCreateSuccessValue = { success: true }
  /**
   * create-history service test
   */
  it('SUCCESS CREATE HISTORY - 성공적으로 지출내역 생성 시, 성공객체 반환', async () => {
    jest.spyOn(historyUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(historiesRepository, 'insertHistory').mockResolvedValue(testInsertResultToSuccess)
    const insertResult = await historiesService.createHistory(testUserInfo, createHistoryDto)

    expect(insertResult).toMatchObject(testCreateSuccessValue)
  })

  it('FAIL CREATE HISTORY - 트랜잭션 오류로 인한 실패시, err.status : 500 반환', async () => {
    jest.spyOn(historyUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(historiesRepository, 'insertHistory').mockResolvedValue(testInsertResultToFail)
    try {
      await historiesService.createHistory(testUserInfo, createHistoryDto)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  })

  /**
   * get-histories test values
   */
  const testGetHistoriesValue = [
    { id: 1, category: '주거비', amount: 50000, date: '03-26 21:00' },
    { id: 2, category: '식비', amount: 60000, date: '03-26 21:01' },
  ]
  const testPage = 1
  /**
   * get-histories service test
   */
  it('SUCCESS GET HISTORIES - 지출내역 목록(배열) 반환', async () => {
    jest.spyOn(historiesRepository, 'findHistories').mockResolvedValue(testGetHistoriesValue)
    const getHistoriesResult = await historiesService.getHistories(testUserInfo, testPage)

    expect(getHistoriesResult).toMatchObject(testGetHistoriesValue)
  })

  /**
   * get-history test values
   */
  const testGetHistoryValue = {
    id: 1,
    category: '주거비',
    amount: 50000,
    memo: 'test',
    imageUrl: 'www.xxx.com',
    date: '03-26 21:00',
  }
  const testHistoryId = 1
  /**
   * get-history service test
   */
  it('SUCCESS GET HISTORIES - 단일 지출내역 반환', async () => {
    jest.spyOn(historiesRepository, 'findHistory').mockResolvedValue(testGetHistoryValue)
    const getHistoryResult = await historiesService.getHistory(testUserInfo, testHistoryId)

    expect(getHistoryResult).toMatchObject(testGetHistoryValue)
  })

  /**
   * update-history service test values
   */
  const testUpdateHistoryId = 1
  const testUpdateHistoryToSuccess = true
  const updateHistoryDto1: Partial<HistoryDto> = { memo: 'test->testest' }
  const updateHistoryDto2: Partial<HistoryDto> = { memo: 'test->testest', 주거비: '5000' }
  const testUpdateHistoryToFail = false
  const testUpdateSuccessValue = { success: true }
  /**
   * update-history service test
   */
  it('SUCCESS UPDATE HISTORY CASE:1 - 지출내역 수정 성공 시(budget_category제외), 성공 객체 반환', async () => {
    jest.spyOn(historiesRepository, 'updateHistory').mockResolvedValue(testUpdateHistoryToSuccess)
    const updateResult = await historiesService.updateHistory(testUserInfo, testUpdateHistoryId, updateHistoryDto1)

    expect(updateResult).toMatchObject(testUpdateSuccessValue)
  })

  it('SUCCESS UPDATE HISTORY CASE:2 - 지출내역 수정 성공 시(budget_category포함), 성공 객체 반환', async () => {
    //line:59 create-history 참조
    jest.spyOn(historyUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(historiesRepository, 'updateHistory').mockResolvedValue(testUpdateHistoryToSuccess)
    const updateResult = await historiesService.updateHistory(testUserInfo, testUpdateHistoryId, updateHistoryDto2)

    expect(updateResult).toMatchObject(testUpdateSuccessValue)
  })

  it('FAIL UPDATE HISTORY - 지출내역 수정 실패 시, err.status 400 반환', async () => {
    jest.spyOn(historiesRepository, 'updateHistory').mockResolvedValue(testUpdateHistoryToFail)
    try {
      await historiesService.updateHistory(testUserInfo, testUpdateHistoryId, updateHistoryDto1)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.BAD_REQUEST)
    }
  })

  /**
   * remove-history service test values
   * line: 127~ update test values 참조
   */
  /**
   * remove-history service test (=repository.updateHistory : update를 이용한, soft delete 방식)
   */
  it('SUCCESS REMOVE HISTORY - 지출내역 삭제 성공 시, HttpStatus 204 반환(반환 body 없음)', async () => {
    jest.spyOn(historiesRepository, 'updateHistory').mockResolvedValue(testUpdateHistoryToSuccess)
    const removeResult = await historiesService.removeHistory(testUserInfo, testUpdateHistoryId)
    //status: 204
    expect(removeResult).toBeUndefined()
  })

  it('FAIL REMOVE HISTORY - 지출내역 삭제 실패 시, err.status 400 반환', async () => {
    try {
      await historiesService.removeHistory(testUserInfo, testUpdateHistoryId)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.BAD_REQUEST)
    }
  })
})
