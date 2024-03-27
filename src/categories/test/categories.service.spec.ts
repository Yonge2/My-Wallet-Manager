import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from '../categories.service'
import { DataSource } from 'typeorm'
import { HttpStatus } from '@nestjs/common'
import { CategoriesRepository } from '../categories.repository'
import { Category } from '../../database/entities/category.entity'
import { UserInfo } from '../../auth/get-user.decorator'
import { CreateCategoryDto } from '../dto/create-category.dto'

describe('Categories-Service', () => {
  const mockCategoriesRepository = () => ({
    findCategories: jest.fn(),
    createCategory: jest.fn(),
    removeCategory: jest.fn(),
  })

  let categoryService: CategoriesService
  let categoryRepository: CategoriesRepository

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

    categoryRepository = module.get<CategoriesRepository>(CategoriesRepository)
    categoryService = module.get<CategoriesService>(CategoriesService)
  })

  /**
   * get-category service test values
   */
  const testGetCategories = [
    { id: 1, category: 'testCategory1', ...new Category() },
    { id: 2, category: 'testCategory2', ...new Category() },
  ]
  const testGetFailValue = []
  /**
   * get-category service test
   */
  it('SUCCESS GET CATEGORY - 성공적으로 카테고리 조회 시, 카테고리 목록 반환', async () => {
    jest.spyOn(categoryRepository, 'findCategories').mockResolvedValue(testGetCategories)
    const getResult = await categoryService.getCategories()

    expect(getResult).toMatchObject(testGetCategories)
  })

  it('FAIL GET CATEGORY - 조회 실패시, NotFoundException', async () => {
    jest.spyOn(categoryRepository, 'findCategories').mockResolvedValue(testGetFailValue)
    try {
      await categoryService.getCategories()
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.NOT_FOUND)
    }
  })

  /**
   * create-category test values
   */
  const testUserInfo: UserInfo = { id: 1, name: 'test', isManager: true }
  const createCategoryDto: CreateCategoryDto = { category: 'test category' }
  const testInsertResultToSuccess = true
  const testInsertResultToFail = false
  const testCreateSuccessValue = { success: true }
  /**
   * create-category service test
   */
  it('SUCCESS CREATE CATEGORY - 카테고리 생성 성공시, 성공 객체 반환', async () => {
    jest.spyOn(categoryRepository, 'createCategory').mockResolvedValue(testInsertResultToSuccess)
    const createResult = await categoryService.createCategory(testUserInfo, createCategoryDto)

    expect(createResult).toMatchObject(testCreateSuccessValue)
  })

  it('FAIL CREATE CATEGORY - 카테고리 생성 실패시, InternalServerException', async () => {
    jest.spyOn(categoryRepository, 'createCategory').mockResolvedValue(testInsertResultToFail)
    try {
      await categoryService.createCategory(testUserInfo, createCategoryDto)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  })

  /**
   * remove-category service test values
   */
  const testDeleteCategoryId = 1
  const testDeleteResultToSuccess = true
  const testDeleteResultToFail = false
  /**
   * remove-category service test
   */
  it('SUCCESS DELETE CATEGORY - 카테고리 삭제 성공 시, 해당 객체 반환', async () => {
    jest.spyOn(categoryRepository, 'removeCategory').mockResolvedValue(testDeleteResultToSuccess)

    const deleteResult = await categoryService.deleteCategory(testUserInfo, testDeleteCategoryId)

    expect(deleteResult).toBeUndefined()
  })

  it('Fail DELETE CATEGORY - 삭제 실패 시, BadRequestException', async () => {
    jest.spyOn(categoryRepository, 'removeCategory').mockResolvedValue(testDeleteResultToFail)

    try {
      await categoryService.deleteCategory(testUserInfo, testDeleteCategoryId)
    } catch (err) {
      expect(err['status']).toBe(HttpStatus.BAD_REQUEST)
    }
  })
})
