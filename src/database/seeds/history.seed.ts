import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { History } from '../entities/history.entity'

const SET_HISTORY_NUMBER = 1000

export default class HistorySeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const historyFactory = factoryManager.get(History)
    await historyFactory.saveMany(SET_HISTORY_NUMBER)
  }
}
