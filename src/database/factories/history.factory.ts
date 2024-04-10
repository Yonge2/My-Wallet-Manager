import { setSeederFactory } from 'typeorm-extension'
import { Category } from '../entities/category.entity'
import { History } from '../entities/history.entity'
import { User } from '../entities/user.entity'

const SET_CATEGORY_NUMBER = 6
const SET_USER_NUMBER = 200

export default setSeederFactory(History, async (faker) => {
  const history = new History()
  //1,000 ~ 100,000
  history.amount = faker.number.int({ min: 10, max: 1000 }) * 100
  history.memo = faker.commerce.product()
  history.imageUrl = faker.internet.url()
  history.createdAt = faker.date.recent()
  history.category = { id: faker.number.int({ min: 1, max: SET_CATEGORY_NUMBER }), ...new Category() }
  history.user = { id: faker.number.int({ min: 1, max: SET_USER_NUMBER }), ...new User() }

  return history
})
