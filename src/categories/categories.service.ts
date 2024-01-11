import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { Repository } from 'typeorm'
import { Category } from 'src/database/entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UserInfo } from 'src/auth/get-user.decorator'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategory() {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
    })

    if (!categories.length) {
      throw new NotFoundException('카테고리 준비중')
    }

    return categories
  }

  async createCategory(user: UserInfo, createCategoryDto: CreateCategoryDto) {
    // if (!user.isManager) {
    //   throw new ForbiddenException('관리자가 아닙니다.')
    // }

    try {
      const createCategoryResult = await this.categoryRepository.insert(createCategoryDto)
      return createCategoryResult
    } catch (err) {
      console.log(err)
      throw new BadRequestException('')
    }
  }

  async deleteCategory(user: UserInfo, id: number) {
    // if (!user.isManager) {
    //   throw new ForbiddenException('관리자가 아닙니다.')
    // }

    const isExistCategory = await this.categoryRepository.findOne({ where: { id: id } })
    if (!isExistCategory) {
      throw new NotFoundException('해당 카테고리 없음.')
    }

    const deleteCategory = new Category()
    deleteCategory.id = id
    deleteCategory.isActive = false

    const deleteCategoryResult = await this.categoryRepository.save(deleteCategory)

    if (!deleteCategory.updatedAt) {
      throw new BadRequestException('이미 지워진 데이터이거나, 잘못된 요청.')
    }

    return deleteCategoryResult
  }
}
