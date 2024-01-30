import { setSeederFactory } from 'typeorm-extension'
import { User } from '../entities/user.entity'
import * as bcrypt from 'bcrypt'

export default setSeederFactory(User, async (faker) => {
  const user = new User()
  user.email = faker.internet.email()
  user.name = faker.person.firstName()
  user.password = await bcrypt.hash('123a', 5)
  user.createdAt = faker.date.past()
  return user
})
