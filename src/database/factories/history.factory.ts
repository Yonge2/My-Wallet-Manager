import { setSeederFactory } from 'typeorm-extension'
import { Category } from '../entities/category.entity'
import { History } from '../entities/history.entity'
import { User } from '../entities/user.entity'

export default setSeederFactory(History, async (faker) => {
  const history = new History()
  //1000~100000단위
  history.amount = faker.number.int({ min: 10, max: 1000 }) * 100
  history.memo = faker.commerce.product()
  history.imageUrl = faker.internet.url()
  history.createdAt = faker.date.recent()
  history.category = { id: faker.number.int({ min: 1, max: 5 }), ...new Category() }
  history.user = { id: faker.number.int({ min: 1, max: 20 }), ...new User() }

  return history
})
