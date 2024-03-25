import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthRepository } from './auth.repository'

@Module({
  imports: [PassportModule.register({ session: false }), JwtModule.register({ global: true })],
  providers: [AuthService, JwtStrategy, AuthRepository],
})
export class AuthModule {}
