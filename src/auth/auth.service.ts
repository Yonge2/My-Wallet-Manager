import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../database/entities/user.entity'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import redisClient from '../utils/redis'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  redisRefreshKey = (id: number) => `refreshToken:${id}`

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: loginDto.email, isActive: true } })
    const isCorrectedPassword = await bcrypt.compare(loginDto.password, user.password)

    if (!user || !isCorrectedPassword) {
      throw new ForbiddenException('로그인 정보가 맞지 않습니다.')
    }

    const { email, password, isActive, createdAt, updateddAt, ...payload } = user
    const accessToken = await this.createAccessToken(payload)
    const refreshToken = await this.createRefreshToken({ id: user.id })

    const key = this.redisRefreshKey(user.id)
    //시간변경하기
    await redisClient.set(key, refreshToken, { EX: 1800 })

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    }
  }

  async createAccessToken(payload: { id: number; name: string; isManager: boolean }) {
    const accessTokenPayload = {
      id: payload.id,
      name: payload.name,
      isManager: payload.isManager,
    }
    return this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30m', //this.configService.get<string>('ACCESS_TOKEN_EXPIRE'),
    })
  }

  async createRefreshToken(payload: { id: number }) {
    const refreshTokenPayload = { id: payload.id }

    return this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '3m', //this.configService.get<string>('ACCESS_TOKEN_EXPIRE'),
    })
  }

  async recreateAccessToken(refreshToken: string) {
    try {
      const verifiedResult = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      })

      if (!verifiedResult || !verifiedResult.id) {
        return new ForbiddenException('권한이 없습니다.')
      }

      const key = this.redisRefreshKey(verifiedResult.id)
      const refreshTokenInRedis = await redisClient.get(key)
      if (refreshToken != refreshTokenInRedis) {
        return new ForbiddenException('권한이 없습니다.')
      }

      const user = await this.userRepo.findOne({
        select: { id: true, name: true, isManager: true },
        where: { id: verifiedResult.id, isActive: true },
      })

      return this.createAccessToken(user)
    } catch (e) {
      console.log(e)
      return new ForbiddenException('권한이 없습니다.')
    }
  }
}
