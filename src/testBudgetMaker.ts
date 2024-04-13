import { Budget } from './database/entities/budget.entity'
import { Category } from './database/entities/category.entity'
import dataSource from './data-source'
import { BudgetCategory } from './database/entities/budget-category.entity'

//삽입 시간 체크용
console.log('END', new Date().getHours(), new Date().getMinutes())
dataSource
  .initialize()
  .then(async () => {
    run()
      .then(() => {
        console.log('Budget-Category 생성 완료')
        process.exit()
      })
      .catch((err) => {
        console.log('Budget-Category 비정상 완료', err)
        process.exit(1)
      })
  })
  .catch((err) => console.log('err', err))

/**
 * 테스트용 데이터 만들기.
 * typeorm-extension 내부의 faker-js를 활용한 랜덤 데이터 삽입으로는 에산 설정간 관계를 이어 유효한 데이터 생성에 어려움을 겪었다.
 *
 * user:budget 은 1:1 관계로 데이터 삽입 시, budget의 user_id가 fk 이다. 중복 삽입할 수 없다.
 * 따라서, 갯수만큼 for문을 통해 랜덤데이터를 삽입하여 해결했다.
 *
 * budget : budget-category 는 1:m 관계, 제약조건은 budget-category의 속성인 amount의 합이 budget의 total_budget과 같아야 한다.
 * 실행되고 있는 어플리케이션 단에서 삽입시, 코드에서 필터링이 가능하다. 하지만, 테스트데이터 seeding 시에는 어려움을 겪었다.
 * 해결방법으로 선택한 것은, budget_category를 제외한 전체 seeding 후 개별적으로 데이터를 삽입하는 것이다.
 */
const run = async () => {
  const budgets: { id: number; total: number }[] = await dataSource.manager
    .createQueryBuilder(Budget, 'b')
    .select(['b.user_id AS id', 'b.total_budget AS total'])
    .getRawMany()

  const theNumberOfcategory: { num: number } = await dataSource.manager
    .createQueryBuilder(Category, 'c')
    .select(['count(*) as num'])
    .getRawOne()

  const categoryNum = theNumberOfcategory.num

  for (let i = 0; i < budgets.length; i++) {
    const budget = budgets[i]
    const budgetCategoires = createRandomBudgetCategory(categoryNum)
    const budgetCategoriesLastIndex = budgetCategoires.length - 1

    for (let j = 0; j < budgetCategoriesLastIndex + 1; j++) {
      const percentage = budgetCategoires[j]
      //마지막 요소는 기타로 빼는 작업
      const categoryId = j === budgetCategoriesLastIndex ? categoryNum : j + 1
      const budgetCategory: BudgetCategory = {
        amount: budget.total * (percentage / 100),
        budget: { userId: budget.id },
        category: { id: categoryId },
        ...new BudgetCategory(),
      }
      await dataSource.manager.insert(BudgetCategory, budgetCategory)
    }
  }
}

/**
 * index + 1: category ID, value: percentage of budget, 각 카테고리별 비율을 설정하기 위한 함수
 *
 * ex. [10, 20, 30, 40] => {category 1 : 전체 예산의 10%, category2: 전체 예산의 20%, ...}
 * @param limitNumber the number of category
 * @returns percentage of budget-catgory
 */
const createRandomBudgetCategory = (limitNumber: number) => {
  const randomArray: number[] = []
  let sum = 10

  while (sum) {
    const randomNumber = Math.floor(Math.random() * 10)
    if (randomNumber === 0) {
      continue
    }

    if (sum - randomNumber < 0) {
      continue
    }

    sum -= randomNumber

    if (limitNumber === randomArray.length) {
      randomArray[randomArray.length - 1] += randomNumber * 10
      continue
    }
    randomArray.push(randomNumber * 10)
  }
  return randomArray
}
