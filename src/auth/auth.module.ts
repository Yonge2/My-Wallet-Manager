import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/database/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ session: false }),
    JwtModule.register({ global: true }),
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
