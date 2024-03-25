import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Category } from '../database/entities/category.entity'

@Injectable()
export class CategoriesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findCategories() {
    return await this.dataSource.manager.find(Category)
  }

  async createCategory(category: Category) {
    try {
      await this.dataSource.manager.insert(Category, category)
      return true
    } catch (err) {
      console.log('category insert err : ', err)
      return false
    }
  }

  async removeCategory(categoryId: number) {
    try {
      const removeCategoryJob = await this.dataSource.manager
        .createQueryBuilder()
        .delete()
        .from(Category)
        .where('id = :categoryId', { categoryId })
        .execute()

      if (!removeCategoryJob.affected) {
        throw new Error('삭제된 데이터 없음')
      }
      return true
    } catch (err) {
      console.log('remove category err : ', err)
      return false
    }
  }
}
