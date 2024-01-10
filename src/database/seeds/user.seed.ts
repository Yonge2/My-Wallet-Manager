import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { User } from '../entities/user.entity'

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(User)
    const catsFactory = factoryManager.get(User)

    await catsFactory.saveMany(100)
  }
}

// const postRepository = dataSource.getRepository(PostEntity);

//         const userFactory = factoryManager.get(UserEntity);
// 				const postFactory = factoryManager.get(PostEntity);

// 				const post = await postFactory.make({
//           User: user,
//         });

// 				await postRepository.save(post);
