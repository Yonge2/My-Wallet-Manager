import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as morgan from 'morgan'
import { setupSwagger } from 'src/utils/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  setupSwagger(app)

  app.use(morgan('dev'))

  await app.listen(3000)
}
bootstrap()
