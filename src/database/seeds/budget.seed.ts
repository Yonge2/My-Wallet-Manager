import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { Budget } from '../entities/budget.entity'
import { User } from '../entities/user.entity'

export default class BudgetSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const budgetRepository = dataSource.getRepository(Budget)
    for (let i = 1; i <= 20; i++) {
      await budgetRepository.insert({
        user: { id: i, ...new User() },
        total_budget: (Math.floor(Math.random() * Math.pow(10, 1)) + 1) * 100000,
        ...new Budget(),
      })
    }
  }
}
