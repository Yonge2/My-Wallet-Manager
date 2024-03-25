import { Module } from '@nestjs/common'
import { AuthModule } from './auth.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AuthService } from './auth.service'
import { AuthRepository } from './auth.repository'

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, AuthService, AuthRepository],
})
export class UserModule {}
