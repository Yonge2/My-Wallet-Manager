import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { HttpStatus } from '@nestjs/common'
import { UserInfo } from '../../auth/get-user.decorator'
import { UtilCategoryService } from '../../utils/utils.category.service'
import { BudgetsService } from '../budgets.service'
import { BudgetsRepository } from '../budget.repository'
import { CreateBudgetDto } from '../dto/create-budget.dto'
import { RedisService } from '../../utils/utils.redis.service'
import { UpdateBudgetCategoryDto, UpdateBudgetDto } from '../dto/update-budget.dto'

describe('budgets-Service', () => {
  const mockBudgetRepository = () => ({
    insertBudget: jest.fn(),
    findMyBudget: jest.fn(),
    updateBudget: jest.fn(),
    updateBudgetCategory: jest.fn(),
    calUserBudgets: jest.fn(),
  })

  const mockUitlService = () => ({
    vaildateCategoryBudget: jest.fn(),
  })

  const mockRedisService = () => ({
    usersBudgetSet: jest.fn(),
    usersBudgetGet: jest.fn(),
  })

  let budgetService: BudgetsService
  let budgetRepository: BudgetsRepository
  let budgetUtil: UtilCategoryService
  let reidsUitl: RedisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: BudgetsRepository,
          useValue: mockBudgetRepository(),
        },
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
        {
          provide: UtilCategoryService,
          useValue: mockUitlService(),
        },
        {
          provide: RedisService,
          useValue: mockRedisService(),
        },
      ],
    }).compile()

    budgetRepository = module.get<BudgetsRepository>(BudgetsRepository)
    budgetService = module.get<BudgetsService>(BudgetsService)
    budgetUtil = module.get<UtilCategoryService>(UtilCategoryService)
    reidsUitl = module.get<RedisService>(RedisService)
  })

  /**
   * create-budget service test values
   * 가정 : {category_id : 1, category: 주거비}, {category_id : 2, category: 기타}
   */
  const testUserInfo: UserInfo = { id: 1, name: 'test', isManager: true }
  const createBudgetDto: CreateBudgetDto = { totalAmount: 10000, 주거비: 5000, 기타: 5000 }
  const testCategoryId2amountValue = [
    { id: 1, amount: 5000 },
    { id: 2, amount: 5000 },
  ]
  const testInsertResultToSuccess = true
  const testInsertResultToFail = false
  const testCreateSuccessValue = { success: true }
  /**
   * create-budget service test
   */
  it('SUCCESS CREATE budget - 성공적으로 예산 생성 시, 성공객체 반환', async () => {
    jest.spyOn(budgetUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(budgetRepository, 'insertBudget').mockResolvedValue(testInsertResultToSuccess)
    const insertResult = await budgetService.createBudget(testUserInfo, createBudgetDto)

    expect(insertResult).toMatchObject(testCreateSuccessValue)
  })

  it('FAIL CREATE budget - 트랜잭션 오류로 인한 실패시, err.status : 500 반환', async () => {
    jest.spyOn(budgetUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(budgetRepository, 'insertBudget').mockResolvedValue(testInsertResultToFail)
    try {
      await budgetService.createBudget(testUserInfo, createBudgetDto)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  })

  /**
   * get-budget test values
   */
  const testBudgetFromRepository = [
    { totalAmount: 10000, category: '주거비', amount: 5000 },
    { totalAmount: 10000, category: '기타', amount: 5000 },
  ]
  const testGetbudgetValueToSuccess = { totalAmount: 10000, 주거비: 5000, 기타: 5000 }
  const testGetbudetValueToFail = []
  const message = { message: '등록된 예산이 없습니다. 예산을 등록하세요.' }
  /**
   * get-budget service test
   */
  it('SUCCESS GET budget - 설정 예산 목록(배열) 반환', async () => {
    jest.spyOn(budgetRepository, 'findMyBudget').mockResolvedValue(testBudgetFromRepository)
    const getMyBudgetResult = await budgetService.getMyBudget(testUserInfo)

    expect(getMyBudgetResult).toMatchObject(testGetbudgetValueToSuccess)
  })

  it('FAIL GET BUDGET - 설정한 예산이 없을 때, message 반환', async () => {
    jest.spyOn(budgetRepository, 'findMyBudget').mockResolvedValue(testGetbudetValueToFail)
    const createResult = await budgetService.getMyBudget(testUserInfo)

    expect(createResult).toMatchObject(message)
  })

  /**
   * update-budget service, update-budget_category test values
   */
  const testUpdateBudgetToSuccess = true
  const testUpdateBudgetToFail = false
  const updatebudgetDtoTotalAmount: UpdateBudgetDto = { totalAmount: 30000 }
  const updatebudgetDtoBudgetCategory: UpdateBudgetCategoryDto = { 주거비: 3000, 기타: 37000 }
  const testUpdateSuccessValue = { success: true }
  /**
   * update-budget service, update-budget_category service test
   */
  it('SUCCESS UPDATE BUDGET - 총 예산 수정 성공 시, 성공 객체 반환', async () => {
    jest.spyOn(budgetRepository, 'updateBudget').mockResolvedValue(testUpdateBudgetToSuccess)
    const updateResult = await budgetService.updateBudget(testUserInfo, updatebudgetDtoTotalAmount)

    expect(updateResult).toMatchObject(testUpdateSuccessValue)
  })

  it('FAIL UPDATE BUDGET - 총 예산 수정 실패 시, err.status 500 반환', async () => {
    jest.spyOn(budgetRepository, 'updateBudget').mockResolvedValue(testUpdateBudgetToFail)
    try {
      await budgetService.updateBudget(testUserInfo, updatebudgetDtoTotalAmount)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  })

  it('SUCCESS UPDATE BUDGET_CATEGORY - 세부 예산 수정 성공 시, 성공 객체 반환', async () => {
    //line:70 create-budget 참조
    jest.spyOn(budgetUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(budgetRepository, 'updateBudgetCategory').mockResolvedValue(testUpdateBudgetToSuccess)
    const updateResult = await budgetService.updateBudgetCategory(testUserInfo, updatebudgetDtoBudgetCategory)

    expect(updateResult).toMatchObject(testUpdateSuccessValue)
  })

  it('FAIL UPDATE BUDGET_CATEGORY - 세부 예산 수정 실패 시, err.status 500 반환', async () => {
    jest.spyOn(budgetUtil, 'vaildateCategoryBudget').mockResolvedValue(testCategoryId2amountValue)
    jest.spyOn(budgetRepository, 'updateBudgetCategory').mockResolvedValue(testUpdateBudgetToFail)
    try {
      await budgetService.updateBudgetCategory(testUserInfo, updatebudgetDtoBudgetCategory)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  })

  /**
   * recommend-budget service test values
   */
  const testCalAverageData = [
    { category: '주거비', categoryPerTotal: 0.7 },
    { category: '기타', categoryPerTotal: 0.3 },
  ]
  const successRetrunData = { 기타: 30, 주거비: 70 }
  const failReturnMessage = { message: '아직 등록된 데이터가 없습니다.' }
  const redisCacheMiss = false
  const mockRedisSetResult = 'OK'
  const testGetAverageToFail = []
  /**
   * recommend-budget service test
   * case 1: cache hit -> DB 조회 X
   * case 2: chche miss -> DB 조회
   */
  it('SUCCESS GET USER BUDGETS AVERAGE CASE1 : CACHE HIT - (추천서비스)사용자 평균 예산 설정 반환 )', async () => {
    jest.spyOn(reidsUitl, 'usersBudgetGet').mockResolvedValue(successRetrunData)
    const getRecommendResult = await budgetService.usersBudgetAverage()

    expect(getRecommendResult).toMatchObject(successRetrunData)
  })

  it('SUCCESS GET USER BUDGETS AVERAGE CASE2 : CACHE MISS - (추천서비스)사용자 평균 예산 설정 반환 )', async () => {
    jest.spyOn(reidsUitl, 'usersBudgetGet').mockResolvedValue(redisCacheMiss)
    jest.spyOn(budgetRepository, 'calUserBudgets').mockResolvedValue(testCalAverageData)
    const getRecommendResult = await budgetService.usersBudgetAverage()

    expect(getRecommendResult).toMatchObject(successRetrunData)
  })

  it('FAIL GET USER BUDGETS AVERAGE - 등록한 사용자가 없을 때, message 반환', async () => {
    jest.spyOn(reidsUitl, 'usersBudgetSet').mockResolvedValue(mockRedisSetResult)
    jest.spyOn(reidsUitl, 'usersBudgetGet').mockResolvedValue(redisCacheMiss)
    jest.spyOn(budgetRepository, 'calUserBudgets').mockResolvedValue(testGetAverageToFail)
    const getRecommendResult = await budgetService.usersBudgetAverage()

    expect(getRecommendResult).toMatchObject(failReturnMessage)
  })
})
