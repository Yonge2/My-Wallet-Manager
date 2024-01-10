import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../database/entities/user.entity'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'
import { JoinDto } from './dto/join.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  async join(joinDto: JoinDto) {
    const isExistUser = await this.userRepo.findOne({
      where: { email: joinDto.email, isActive: true },
    })

    if (isExistUser) {
      throw new BadRequestException('이미 가입된 email 입니다.')
    }

    console.log(this.configService.get<number>('SALT_ROUND'))
    const salt = await bcrypt.genSalt(Number(this.configService.get<number>('SALT_ROUND')))
    const hashedPassword = await bcrypt.hash(joinDto.password, salt)

    joinDto.password = hashedPassword

    const joinResult = await this.userRepo.insert(joinDto)
    return joinResult
  }
}
