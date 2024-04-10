import { Seeder } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { Budget } from '../entities/budget.entity'
import { User } from '../entities/user.entity'

const SET_USER_NUMBER = 200

export default class BudgetSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const budgetRepository = dataSource.getRepository(Budget)

    for (let i = 1; i <= SET_USER_NUMBER; i++) {
      await budgetRepository.insert({
        user: { id: i, ...new User() },
        //총 예산 : 10만원~100만원
        total_budget: (Math.floor(Math.random() * Math.pow(10, 1)) + 1) * 100000,
        ...new Budget(),
      })
    }
  }
}
