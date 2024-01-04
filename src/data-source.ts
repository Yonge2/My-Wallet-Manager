import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: process.env.USER_NAME,
  password: process.env.USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/src/database/entities/*.{ts,js}'],
  synchronize: true,
  logging: true,
  timezone: '+09.00',
})
