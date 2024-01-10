import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

export const typeOrmConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOSTNAME'),
    port: 3306,
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PW'),
    database: configService.get<string>('DB_NAME'),
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    autoLoadEntities: true,
    synchronize: true,
    // logging: ['query', 'error'],
    dropSchema: true,
    namingStrategy: new SnakeNamingStrategy(),
    migrations: [__dirname + '/migration/**/*.{ts,js}'],
  }
}
