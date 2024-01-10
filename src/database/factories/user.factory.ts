import { setSeederFactory } from 'typeorm-extension'
import { User } from '../entities/user.entity'
export default setSeederFactory(User, (faker) => {
  const user = new User()
  user.email = faker.internet.email()
  user.password = faker.string.uuid()
  user.createdAt = faker.date.anytime()
  return user
})
