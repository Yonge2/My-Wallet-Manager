import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from '../categories.service'
import { DataSource } from 'typeorm'
import { Category } from '../../database/entities/category.entity'
import { CategoriesRepository } from '../categories.repository'

type MockRepository = Partial<Record<keyof CategoriesRepository, jest.Mock>>

describe('CategoriesService', () => {
  const mockCategoriesRepository = () => ({
    findCategories: jest.fn(),
    createCategory: jest.fn(),
    removeCategory: jest.fn(),
  })

  let categoryService: CategoriesService
  let categoryRepository: MockRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository(),
        },
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
      ],
    }).compile()

    categoryRepository = module.get<MockRepository>(CategoriesRepository)
    categoryService = module.get<CategoriesService>(CategoriesService)
  })

  it('Success GET CATEGORY - 성공적으로 카테고리 조회 시, 카테고리 목록 반환', async () => {
    const testSuccessValue = [
      { id: 1, category: 'testCategory1', ...new Category() },
      { id: 2, category: 'testCategory2', ...new Category() },
    ]
    const testCategories = [
      { id: 1, category: 'testCategory1', ...new Category() },
      { id: 2, category: 'testCategory2', ...new Category() },
    ]

    jest.spyOn(categoryRepository, 'findCategories').mockResolvedValue(testSuccessValue)
    const getResult = await categoryService.getCategories()

    expect(getResult).toMatchObject(testCategories)
  })
})
