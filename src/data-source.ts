import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

dotenv.config()

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/database/entities/*.entity.{ts,js}'],
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
})
