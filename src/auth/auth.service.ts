import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import redisClient from '../utils/redis'
import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  private readonly ACCESS_EXPIRE_HOUR = this.configService.get<string>('ACCESS_EXPIRE_HOUR')
  private readonly REFRESH_EXPIRE_DAY = this.configService.get<string>('REFRESH_EXPIRE_DAY')
  private readonly JWT_SECRET = this.configService.get<string>('JWT_SECRET')

  redisRefreshKey = (id: number) => `refreshToken:${id}`

  async login(loginDto: LoginDto) {
    try {
      const user = await this.authRepository.findLoginInfo(loginDto.email)

      const isCorrectedPassword = await bcrypt.compare(loginDto.password, user.password)
      if (!isCorrectedPassword) {
        throw new HttpException('틀린 로그인 정보', HttpStatus.UNAUTHORIZED)
      }

      const { email, password, ...payload } = user
      const accessToken = await this.createAccessToken(payload)
      const refreshToken = await this.createRefreshToken({ id: user.id })

      const key = this.redisRefreshKey(user.id)
      await redisClient.set(key, refreshToken, {
        // n * day
        EX: Number(this.REFRESH_EXPIRE_DAY) * 60 * 60 * 24,
      })
      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    } catch (err) {
      throw new HttpException('틀린 로그인 정보', HttpStatus.UNAUTHORIZED)
    }
  }

  async createAccessToken(payload: { id: number; name: string; isManager: boolean }) {
    const accessTokenPayload = {
      id: payload.id,
      name: payload.name,
      isManager: payload.isManager,
    }
    return this.jwtService.sign(accessTokenPayload, {
      secret: this.JWT_SECRET,
      expiresIn: this.ACCESS_EXPIRE_HOUR + 'h',
    })
  }

  async createRefreshToken(payload: { id: number }) {
    const refreshTokenPayload = { id: payload.id }

    return this.jwtService.sign(refreshTokenPayload, {
      secret: this.JWT_SECRET,
      expiresIn: this.REFRESH_EXPIRE_DAY + 'd',
    })
  }

  async recreateAccessToken(refreshToken: string) {
    try {
      const verifiedResult = this.jwtService.verify(refreshToken, {
        secret: this.JWT_SECRET,
      })
      const userId = verifiedResult.id

      if (!verifiedResult || !verifiedResult.id) {
        return new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED)
      }

      const key = this.redisRefreshKey(userId)
      const refreshTokenInRedis = await redisClient.get(key)
      if (refreshToken != refreshTokenInRedis) {
        throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED)
      }

      const userInfo = await this.authRepository.findUserInfo(userId)

      return this.createAccessToken(userInfo)
    } catch (err) {
      console.log('recreateAccessToken exception : ', err)
      throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED)
    }
  }
}
