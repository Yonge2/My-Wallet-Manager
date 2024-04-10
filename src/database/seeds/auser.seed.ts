import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { User } from '../entities/user.entity'

const SET_USER_NUMBER = 200

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userFactory = factoryManager.get(User)
    await userFactory.saveMany(SET_USER_NUMBER)
  }
}
