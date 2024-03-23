import { Budget } from '../src/database/entities/budget.entity'
import { Category } from '../src/database/entities/category.entity'
import dataSource from './data-source'

/**
 * 테스트용 데이터 만들기.
 * typeorm-extension 내부의 faker-js를 활용한 랜덤 데이터 삽입으로는 에산 설정간 관계를 이어주는 것에 어려움을 겪었다.
 *
 * user:budget 은 1:1 관계로 데이터 삽입 시, budget의 user_id가 fk 이다. 중복 삽입할 수 없다.
 * 따라서, 갯수만큼 for문을 통해 랜덤데이터를 삽입하여 해결했다.
 *
 * budget : budget-category 는 1:m 관계, 물리적 제약조건은 걸지 못했지만,
 * 논리적 제약조건은 budget-category의 속성인 amount의 합이 budget의 total_amount와 같아야 한다.
 * 실행되고 있는 어플리케이션 단에서 삽입시, 코드에서 필터링이 가능하다. 하지만, 테스트데이터 seeding 시에는 어려움을 겪었다.
 * 해결방법으로는, 전체를 seeding 후 제약조건을 걸어, 개별적으로 데이터를 삽입하는 것이다.
 */
const run = async () => {
  const budgets = await dataSource.createQueryBuilder(Budget, 'b').select(['h.id', 'h.total_budget']).getMany()
  const theNumberOfcategory = await dataSource.createQueryBuilder(Category, 'c').select(['count(*) as num']).getRawOne()

  console.log(budgets, theNumberOfcategory)

  // const insertBudgetCategory = budgets.map((ele: { id: number; total_budget: number }) => {
  //   const
  //   //total_budget을 어떻게 나눌것인가 고민
  //   const randomCategory = (Math.floor(Math.random() * Math.pow(10, 1)) + 1) % theNumberOfcategory.num
  //   for (let i = 1; i <= randomCategory; i++) {}
  // })
}

// run()
