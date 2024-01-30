import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { History } from '../entities/history.entity'

export default class HistorySeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(History)
    const userFactory = factoryManager.get(History)
    await userFactory.saveMany(100)
  }
}
