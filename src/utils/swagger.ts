import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
}

export const setupSwagger = (app: INestApplication) => {
  const option = new DocumentBuilder()
    .setTitle('My-Wallet-Manager API docs')
    .setDescription('My-Wallet-Manager API docs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, option)
  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions)
}
