import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { Budget } from '../entities/budget.entity'
import { User } from '../entities/user.entity'

export default class BudgetSeeder implements Seeder {
  private readonly THE_NUMBER_USER = 100

  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const budgetRepository = dataSource.getRepository(Budget)

    for (let i = 1; i <= this.THE_NUMBER_USER; i++) {
      await budgetRepository.insert({
        user: { id: i, ...new User() },
        //총 예산 : 10만원~100만원
        total_budget: (Math.floor(Math.random() * Math.pow(10, 1)) + 1) * 100000,
        ...new Budget(),
      })
    }
  }
}
