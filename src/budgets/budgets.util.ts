import { BadRequestException, Injectable } from '@nestjs/common'
import { Category } from 'src/database/entities/category.entity'
import { DataSource } from 'typeorm'

@Injectable()
export class BudgetsUtil {
  constructor(private dataSource: DataSource) {}

  /**
   * 각 { 예산 카테고리(id) : 카테고리별 예산 } 검사 및 매칭
   * front-end에서 처리해도 좋은 기능, back-end에서 처리할 경우 필요
   */
  async vaildateCategoryBudget(budgetCategoryField: { [category: string]: any }) {
    if (!budgetCategoryField) {
      return []
    }
    /**
     * 카테고리 get : {id, category}[] -> 카테고리 : {카테고리1(string) : 예산1, 카테고리2(string) : 예산2} 비교
     * -> {category-id : 예산}[] 반환
     */
    const categories = await this.dataSource.manager
      .getRepository(Category)
      .createQueryBuilder('category')
      .select(['category.id', 'category.category'])
      .where('category.is_active = true')
      .getMany()

    //DB에 저장된 카테고리 배열
    const categoriesValue = categories.map((value: { id: number; category: string }) => {
      return value.category
    })

    const budgetCategoryObj = Object.keys(budgetCategoryField).map((key) => {
      const amount = Number(budgetCategoryField[`${key}`])
      const validCateogryIdx = categoriesValue.indexOf(key)

      if (validCateogryIdx === -1) throw new BadRequestException('사용할 수 없는 카테고리가 포함되어 있습니다.')

      return { id: categories[validCateogryIdx].id, amount: amount }
    })

    return budgetCategoryObj
  }
}
