import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from '../categories.service'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Category } from '../../database/entities/category.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe('CategoriesService', () => {
  const mockUserRepository = () => ({
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
  })

  let categoryService: CategoriesService
  let categoryRepository: MockRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockUserRepository(),
        },
      ],
    }).compile()

    categoryRepository = module.get<MockRepository<Category>>(getRepositoryToken(Category))
    categoryService = module.get<CategoriesService>(CategoriesService)
  })

  it('should be defined', () => {
    expect(categoryService.getCategory).toBeDefined()
    expect(categoryService.createCategory).toBeDefined()
    expect(categoryService.deleteCategory).toBeDefined()
  })

  it('Success GET CATEGORY - 성공적으로 카테고리 조회 시, 카테고리 목록 반환', async () => {
    const testSuccessValue = [
      { id: 1, category: 'testCategory1' },
      { id: 2, category: 'testCategory2' },
    ]
    const testCategories = [
      { id: 1, category: 'testCategory1' },
      { id: 2, category: 'testCategory2' },
    ]
    jest.spyOn(categoryRepository, 'find').mockResolvedValue(testSuccessValue)
    const getResult = await categoryService.getCategory()

    expect(getResult).toMatchObject(testCategories)
  })

  it('Fail GET CATEGORY - 조회 실패시, NotFoundException', async () => {
    const testFailValue = []

    jest.spyOn(categoryRepository, 'find').mockResolvedValue(testFailValue)
    try {
      await categoryService.getCategory()
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException)
    }
  })

  const testUserInfo = { id: 'test-uuid', name: 'test', isManager: true }
  const createCategoryDto = { category: 'test category' }

  it('Success CREATE CATEGORY - 카테고리 생성 성공시, 성공 객체 반환', async () => {
    const testValue = { success: true }
    jest.spyOn(categoryRepository, 'insert').mockResolvedValue(testValue)

    const createResult = await categoryService.createCategory(testUserInfo, createCategoryDto)

    expect(createResult).toMatchObject(testValue)
  })

  it('Fail CREATE CATEGORY - 카테고리 생성 실패시, BadRequestException', async () => {
    jest.spyOn(categoryRepository, 'insert').mockRejectedValue('')

    try {
      await categoryService.createCategory(testUserInfo, createCategoryDto)
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
    }
  })

  const testDeleteCategoryId = 1

  it('Success DELETE CATEGORY - 카테고리 삭제 성공 시, 해당 객체 반환', async () => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue({ id: testDeleteCategoryId })
    jest.spyOn(categoryRepository, 'save').mockResolvedValue({ updatedAt: Date() })

    const deleteResult = await categoryService.deleteCategory(testUserInfo, testDeleteCategoryId)

    expect(deleteResult).toBeUndefined()
  })

  it('Fail DELETE CATEGORY - 해당 카테고리 없을 때, NotFoundException', async () => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(undefined)

    try {
      await categoryService.deleteCategory(testUserInfo, testDeleteCategoryId)
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException)
    }
  })

  it('Fail DELETE CATEGORY - 삭제 실패 시, BadRequestException', async () => {
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue({ id: testDeleteCategoryId })
    jest.spyOn(categoryRepository, 'save').mockResolvedValue({ id: testDeleteCategoryId })

    try {
      await categoryService.deleteCategory(testUserInfo, testDeleteCategoryId)
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
    }
  })
})
