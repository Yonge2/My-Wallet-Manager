import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { Category } from '../database/entities/category.entity'
import { UserInfo } from '../auth/get-user.decorator'
import { CategoriesRepository } from './categories.repository'

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoriesRepository) {}

  async getCategories() {
    const categories = await this.categoryRepository.findCategories()
    if (!categories.length) {
      throw new HttpException('카테고리 준비중', HttpStatus.NOT_FOUND)
    }
    return categories
  }

  async createCategory(user: UserInfo, createCategoryDto: CreateCategoryDto) {
    // if (!user.isManager) {
    //   throw new ForbiddenException('관리자가 아닙니다.')
    // }
    const category = {
      ...createCategoryDto,
      ...new Category(),
    }
    const createCategoryResult = await this.categoryRepository.createCategory(category)
    if (!createCategoryResult) {
      throw new HttpException('삽입 하지 못함.', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
    }
  }

  async deleteCategory(user: UserInfo, id: number) {
    // if (!user.isManager) {
    //   throw new ForbiddenException('관리자가 아닙니다.')
    // }

    const removeCategoryReuslt = await this.categoryRepository.removeCategory(id)
    if (!removeCategoryReuslt) {
      throw new HttpException('데이터를 삭제하지 못했습니다.', HttpStatus.BAD_REQUEST)
    }

    return
  }
}
