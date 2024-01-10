import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/database/entities/user.entity'
import { AuthModule } from './auth.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AuthService } from './auth.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [UserService, AuthService],
})
export class UserModule {}
