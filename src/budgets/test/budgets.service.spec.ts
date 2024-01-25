import { Test, TestingModule } from '@nestjs/testing'
import { BudgetsService } from '../budgets.service'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Category } from '../../database/entities/category.entity'

//todo : 1.15 - transaction test code 작성 해야함. (어려움 ㅠ)

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>
const mockRepository = () => ({
  createQueryBuilder: jest.fn(),
})

export const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(() => ({
  createQueryRunner: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    release: jest.fn(),
    rollbackTransaction: jest.fn(),
    manager: {
      getRepository: jest.fn().mockImplementation((entity: any) => ({
        insert: jest.fn(),
      })),
    },
  })),
}))
//https://www.reddit.com/r/Nestjs_framework/comments/xo0qkb/how_can_i_mock_the_typeorm_data_source_for_unit/

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>
}

describe('BudgetsService', () => {
  let categoryRepository: MockRepository
  let budgetService: BudgetsService
  let dataSourceMock: MockType<DataSource>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository(),
        },
        {
          provide: DataSource,
          useValue: dataSourceMockFactory,
        },
      ],
    }).compile()

    categoryRepository = module.get<MockRepository<Category>>(getRepositoryToken(Category))
    budgetService = module.get<BudgetsService>(BudgetsService)
    dataSourceMock = module.get(DataSource)
  })

  it('should be defined', () => {
    expect(budgetService).toBeDefined()
  })

  const testUserInfo = { id: 'test-uuid', name: 'test', isManager: true }

  it('Success - CREATE BUDGET, 성공 시 객체 {Success: true} 반환', async () => {
    const mockCategory = [
      { id: 1, category: '식비' },
      { id: 2, category: '주거비' },
      { id: 3, category: '기타' },
    ]
    const testCreateBudgetDto = {
      totalAmount: 100000,
      주거비: '50000',
      기타: '50000',
    }
    jest.spyOn(categoryRepository, 'createQueryBuilder').mockResolvedValue(mockCategory)
  })
})
