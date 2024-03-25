import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Category } from 'src/database/entities/category.entity'
import { DataSource } from 'typeorm'

@Injectable()
export class UtilCategoryService {
  constructor(private dataSource: DataSource) {}

  /**
   * 각 { 예산 카테고리(id) : 카테고리별 예산 } 검사 및 매칭
   * ex. { '주거비': 500 } -> '주거비' 카테고리 확인 -> { 1 : 500 } 으로 반환 (주거비의 category_id가 1일 경우)
   * front-end에서 처리해도 좋은 기능, back-end에서 처리할 경우 필요
   * @returns {id: number, amount:number}[]
   */
  async vaildateCategoryBudget(budgetCategoryField: { [category: string]: any }) {
    if (!budgetCategoryField) {
      return []
    }
    const categories = await this.dataSource.manager.find(Category)
    const categoriesValue = categories.map((value: { id: number; category: string }) => {
      return value.category
    })

    const budgetCategoryObj = Object.keys(budgetCategoryField).map((category) => {
      const amount = Number(budgetCategoryField[`${category}`])
      const validCateogryIdx = categoriesValue.indexOf(category)

      if (validCateogryIdx === -1) {
        throw new Error('사용할 수 없는 카테고리가 포함되어 있습니다.')
      }

      return { id: categories[validCateogryIdx].id, amount: amount }
    })

    return budgetCategoryObj
  }
}
