import { Seeder } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { Category } from '../entities/category.entity'

export default class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const categoryRepository = dataSource.getRepository(Category)
    await categoryRepository.insert([
      { category: '식비' },
      { category: '주거비' },
      { category: '교통비' },
      { category: '자기계발비' },
      { category: '유흥비' },
      { category: '기타' },
    ])
  }
}
